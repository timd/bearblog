interface ZSFNoteRow {
    Z_PK: number;
    ZTITLE: string;
    ZTEXT: string;
    ZUNIQUEIDENTIFIER: string;
    ZMODIFICATIONDATE: string;
    ZARCHIVED: number;
  }
  
interface ZSFNoteTagRow {
  Z_PK: number;
}

interface Z_5TAGSRow {
  Z_5NOTES: number;
}

interface Post {
  fileName: string
  postContent: string
}
  
  export { ZSFNoteRow, ZSFNoteTagRow, Z_5TAGSRow, Post }
  