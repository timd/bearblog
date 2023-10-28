import path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv'
import { ZSFNoteRow, Post } from "./interfaces";

dotenv.config()

export function createBlogContent(notes: ZSFNoteRow[]): Array<Post> {
  
    const posts = Array<Post>()
  
    notes.forEach(note => {
  
        const filename = createFilename(note.ZTITLE)

        const postContent = `
+++
title = ${note.ZTITLE}
date = ${createDate()}
draft = false
+++
${note.ZTEXT}
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

export function createBlogPostFiles(posts: Array<Post>) {

    posts.forEach(post => {

        const directory = process.env.HUGO_POSTS_PATH || '';

        const fileName = createFilename(post.fileName);

        const content = post.postContent;
        
        const filePath = path.join(directory, `${fileName}`);
        
        const fullPath = filePath + '.md'
        
        // Write to the file
        fs.writeFile(fullPath, content, 'utf8', (err) => {
            if (err) {
                console.log('An error occurred:', err);
            } else {
                console.log(`Markdown file saved at ${fullPath}`);
            }
        });
        
    });

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