import path from 'path';
import dotenv from 'dotenv'
import { promises as fs } from 'fs';
import { ZSFNoteRow, Post } from "./interfaces";

dotenv.config()

export function createBlogContent(notes: ZSFNoteRow[]): Array<Post> {
  
    const posts = Array<Post>()
  
    notes.forEach(note => {

        const filename = createFilename(note.ZTITLE, note.ZCREATIONDATE)

        const content = removeFirstLine(note.ZTEXT)
        const debearedContent = removeBearTag(content)
        const cleanContent = cleanString(debearedContent)
        
        const tags = extractTags(cleanContent)
        const detaggedContent = removeTags(cleanContent)
        const despacedContent = despaceContent(detaggedContent)

        const postContent = `---
title: "${note.ZTITLE}"
date: ${createDate()}
draft: false
tags: ${tags}
---
${despacedContent}
        `;

        const post: Post = {
            fileName: filename,
            postContent: postContent
        }
  
        posts.push(post)
  
    })
  
    return posts
  
}

function createFilename(post: string, creationDate: string): string {
    const dashedPostName = post.replace(/ /g, "-");
    const coreDataCreationDate: number = parseFloat(creationDate);
    const formattedDate = coreDataTimestampToHumanReadable(coreDataCreationDate)
    const filename = `${formattedDate}-${dashedPostName}`
    return filename;
}

export async function createBlogPostFiles(posts: Array<Post>) {

    const promises = posts.map( async (post) => {

        const directory = process.env.HUGO_POSTS_PATH || '';

        const fileName = post.fileName;

        const content = post.postContent;
        
        const filePath = path.join(directory, `${fileName}`);
        
        const fullPath = filePath + '.md'
        
        try {
            await fs.writeFile(fullPath, content, 'utf-8');
            console.log(`Markdown file saved at ${fullPath}`);;
        } catch (error) {
            console.error(`An error occurred: ${error}`);
        }
        
    });

    await Promise.all(promises)

  }

  function createDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const offsetHours = '+02:00'; // replace this with your desired time zone offset
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetHours}`;
    return formattedDate
  }

  export function gitTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

function removeFirstLine(str: string): string {
    const lines = str.split('\n');
    lines.shift();
    return lines.join('\n');
}

export function removeBearTag(original: string): string {
    const BEAR_BLOG_TAG = process.env.BEAR_BLOG_TAG || ''
    const regex = new RegExp(`#${BEAR_BLOG_TAG}\\s`, 'g');
    return original.replace(regex, '');
} 

function cleanString(str: string): string {
    const trimmedString = str.trim();
    const cleanedString = trimmedString.replace(/^\s*\n/gm, '');  // Remove empty lines at the start
    return cleanedString;
}

export function extractTags(sourceString: string): string {
    const hashtags = extractTagsWithHash(sourceString)
    return convertTagsToString(hashtags);
}

function removeTags(sourceString: string): string {
    const tagsArray = extractTagsWithHash(sourceString);
    const tagsString = convertTagsToString(tagsArray);
    const textWithoutTags = removeTagsFromString(tagsArray, sourceString);
    return textWithoutTags
    
}

// Extract tags from the string and include the '#' in the result
function extractTagsWithHash(input: string): string[] {
    const regex = /#(\w+)/g;
    const matches = input.match(regex) || [];
    return matches;
}
  
// Convert the array of tags to the desired string format, removing the '#' characters
    function convertTagsToString(tags: string[]): string {
    const tagsWithoutHash = tags.map(tag => `"${tag.substring(1)}"`);
    return `[${tagsWithoutHash.join(", ")}]`;
}
  
  // Remove tags from the source string
  function removeTagsFromString(tags: string[], source: string): string {
    let updatedSource = source;
    tags.forEach(tag => {
      const regex = new RegExp(`\\${tag}\\b`, 'g');
      updatedSource = updatedSource.replace(regex, '');
    });
    return updatedSource;
  }

function despaceContent(input: string): string {
    // Split the string by new lines to get an array of paragraphs
    const paragraphs = input.split('\n');

    // Join the array back into a single string, adding an extra new line between each paragraph
    return paragraphs.join('\n\n');
}

function coreDataTimestampToHumanReadable(coreDataTimestamp: number): string {
    // CoreData timestamp is in seconds since 2001-01-01
    // JavaScript Date timestamp is in milliseconds since 1970-01-01
    // Calculate the number of milliseconds between 1970-01-01 and 2001-01-01
    const millisecondsBetween1970And2001 = Date.UTC(2001, 0, 1);
    
    // Convert CoreData timestamp to milliseconds and add the offset
    const jsTimestamp = coreDataTimestamp * 1000 + millisecondsBetween1970And2001;
    
    // Create a new Date object
    const date = new Date(jsTimestamp);
    
    // Format the date
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate
  }
