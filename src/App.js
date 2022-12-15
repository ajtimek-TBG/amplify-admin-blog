
import './App.css';
import { DataStore } from '@aws-amplify/datastore';
import { Post } from './models';
import { Comment } from './models';
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App({signOut, user}) {

  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])

  const getPosts = async () => {
    // const models = await DataStore.query(Post, c => c.username.contains(user.username));
    const models = await DataStore.query(Post)
    setPosts(models);
    console.log(models);
  }

  useEffect(() => {
    console.log(user.username);
    

    const getComments = async () => {
      const models = await DataStore.query(Comment);
      setComments(models);
    }

    getPosts()
    getComments()
    // on load, getPosts() runs. getPosts grabs all Posts from the cloud (models) and sets it to 'posts'
    // on load, getComments() runs. getComments grabs all Comments from the cloud (models) and sets it to 'comments'
  }, [])

  const createPost = async () => {
    // a new object 'post' is created with title and content keys, which match the schema. 
    // the object is then saved in the datastore (cloud?) 
    // it is then logged to make sure it is correct
    const post = {
      title: window.prompt('blog post title'),
      content: window.prompt('blog post content'),
      username: user.username
    }

    const newPost = await DataStore.save(
      new Post(post)
    )
    console.log(newPost);
    getPosts()
  }

  const updateTitle = async (id) => {
    // newTitle object consists of new post title and ID of post we want to edit
    const newTitle = {
      title: window.prompt('Update your title'),
      id: id
    }
    // get the original post from the dataStore
    // save the original post with the updated title
    const original = await DataStore.query(Post, id);
    await DataStore.save(
      Post.copyOf(original, updated => {
        updated.title = newTitle.title
      })
    );
  }

  const createComment = async (id) => {
    // a new object 'comment' is created with title, author, and postID keys, which match the schema. 
    // the object is then saved in the datastore (cloud?) 
    console.log(id);
    const comment = {
      text: window.prompt('comment text'),
      author: window.prompt('your name'),
      postID: id
    }

    const newComment = await DataStore.save(
      new Comment(comment)
    )
    console.log(newComment);
  }

  const deletePost = async (id) => {
    // deletes a post based on its ID
    const modelToDelete = await DataStore.query(Post, id);
    DataStore.delete(modelToDelete);

    // getPosts fires for refresh
    const getPosts = async () => {
      const models = await DataStore.query(Post);
      setPosts(models);
    }
    getPosts()
  }

  // in this return, posts is mapped through and displays each post
  return (
    <div className="App">
      <>
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
    </>
      <button onClick={createPost}>Create post</button>
      <div className='blogWrapper'>
        {posts.map(post =>
          <div className='blogBox' key={post.id} >
            <h6>Author: {post.username}</h6>
            <h1>{post.title}</h1>
            <h5>{post.content}</h5>
            {comments.map(comment => {
              if (comment.postID === post.id) {
                return (
                  <div key={comment.id}>
                    <p>{comment.author} says: {comment.text}</p>
                  </div>
                )
              }
            })}
            {user.username === post.username ? (
              <>
                <button onClick={() => createComment(post.id)}>Add comment</button>
              <button onClick={() => deletePost(post.id)}>Delete post</button>
              <button onClick={() => updateTitle(post.id)}>Update title</button>
              </>
            ) : (
              <button onClick={() => createComment(post.id)}>Add comment</button>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuthenticator(App);
