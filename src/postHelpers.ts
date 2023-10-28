import path from 'path';
import dotenv from 'dotenv'
import { promises as fs } from 'fs';
import { ZSFNoteRow, Post } from "./interfaces";

dotenv.config()

export function createBlogContent(notes: ZSFNoteRow[]): Array<Post> {
  
    const posts = Array<Post>()
  
    notes.forEach(note => {
  
        const filename = createFilename(note.ZTITLE)

        const content = removeFirstLine(note.ZTEXT)
        const debearedContent = removeBearTag(content)
        const cleanContent = cleanString(debearedContent)
        
        const tags = extractTags(cleanContent)
        const detaggedContent = removeTags(cleanContent)

        const postContent = `---
title: "${note.ZTITLE}"
date: ${createDate()}
draft: false
tags: ${tags}
---
${detaggedContent}
        `;

        const post: Post = {
            fileName: filename,
            postContent: postContent
        }
  
        posts.push(post)
  
    })
  
    return posts
  
}

function createFilename(post: string): string {

    const dashedPostName = post.replace(/ /g, "-");

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;  // Months are zero-based
    const day = today.getDate();

    const paddedMonth = String(month).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');

    const formattedDate = `${year}-${paddedMonth}-${paddedDay}`;

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

function removeBearTag(original: string): string {
    const regex = new RegExp('#bear-blog-tag', 'g');
    return original.replace(regex, '');
} 

function cleanString(str: string): string {
    const trimmedString = str.trim();
    const cleanedString = trimmedString.replace(/^\s*\n/gm, '');  // Remove empty lines at the start
    return cleanedString;
}

function extractTags(sourceString: string): string {
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