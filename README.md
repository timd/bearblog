# Bearblog

Being a utility to push content from Bear.app to blogging platforms

## What is this?

It's a Node-based proof-of-concept to see if it's possible to create a tool that can transfer content from Bear.app to blogging platforms.

Bear is a super-slick and easy-to-use text and note-taking tool. I'd like to have a blogging platform with the same ease of use when it comes to content creation, but I've not found anything that really fits my needs.

This project is an attempt to fix that.  The idea is that I'll be able to create a note in Bear, tag it, and have the content magically pushed to my blog, thereby inflicting yet more of my dubiously-valued opinions on the world at large.

I'm intrinsically-attracted to really simple tools that just Get Out Of The Way, and I like what these kinds of tools enable. [Russell Davies](https://thedobook.co/products/do-interesting-notice-collect-share) and [others](https://www.iot.io/blog/2023/09/10/noticing.html) explain it way better than I do.

I'm overthinking all of this, aren't I?

## How does it work right now?

Bear.app saves its data to a SQLite database which is accessible when Bear is installed on a Mac. The database format is very straight-forward, and note content is stored as Markdown.

This app grabs any notes in the database that have the `bear-blog-tag`, does some transformation and then saves the content as a Markdown file in the format that the Hugo blog engine expects. Then the changes are pushed to the Git repo that runs my blog, at which point the auto-deployment process kicks in and the new posts are deployed to the live site.

## Can I use it?

Right now, you probably don't want to, because it's very brittle. Give it a little bit more development, though, and then it might be useable as an alpha version. Caveats:
- it will only ever work with Bear
- it will only ever work on a Mac, because a) Bear and b) you can't get access to the database on iOS because it's sandboxed
- it's not an installable app right now, so needs some command-line foo.
Get in touch if you're really masocistic and want to give it a go.

## How will it work in the future?

Ideally, there will be a range of blogging platforms that are supported. But baby steps...

## What's next?

- Fixing the annoying false-positive bug when the repo's pushed. It works, but reports an error
- Checking if repeatedly-creating Markdown files for the same content is an issue (shouldn't be)
- Figuring out how to detect, find, extract and upload images
- Seeing how much rich Markdown magic will be supportable
- Put a frontend on the Node part, so it's possible to configure to reflect specific configs on different machines - file locations and so on
- Automation? Maybe watching the database as a background service, so that the sync takes place invisibly?