// BEGIN (write your solution here)
export default class Post {
  static id = 1;

  constructor(title, body, author, date) {
    this.id = Post.id;
    Post.id += 1;
    this.title = title;
    this.body = body;
    this.author = author;
    this.date = date;
  }
}
// END
