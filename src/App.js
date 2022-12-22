
import './App.css';
import { DataStore } from '@aws-amplify/datastore';
import { Post } from './models';
import { Comment } from './models';
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import axios from 'axios';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';



import awsExports from './aws-exports';
Amplify.configure(awsExports);



function App({ signOut, user }) {

  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [showInputFields, setShowInputFields] = useState(false)
  const apiItems = 'https://ta328ylnla.execute-api.us-west-1.amazonaws.com/staging/items/1'
  const apiBooks = 'https://ta328ylnla.execute-api.us-west-1.amazonaws.com/staging/books/1'

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

  const renderInputFields = () => {
    setShowInputFields(true)
    console.log(showInputFields);
  }

  const invokeItems = () => {
    axios.post(apiItems)
      .then(response => {
        console.log(response);
      })
      .catch((e) => {
        console.log(e);
      })
  }

  const invokeBooks = () => {
    axios.get(apiBooks)
      .then(response => {
        console.log(response);
      })
      .catch((e) => {
        console.log(e);
      })
  }

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
        <h1 id='appHeader'>Amplify Blog</h1>
        <div className='blogWrapper'>
          <div className='invokes'>
            <Button onClick={invokeItems}>Invoke lambda(items)</Button>
          </div>
          <div className='invokes'>
            <Button onClick={invokeBooks}>Invoke lambda(books)</Button>
          </div>
        </div>
        <hr></hr>

        <h2>Hello {user.username}</h2>
        <div className='buttonWrapper'>
          <Button onClick={signOut}>Sign out</Button>

          {/* <Button onClick={createPost}>Create post</Button> */}
          <Button onClick={renderInputFields}>Create post</Button>
        </div>
        {showInputFields === true ? (
          <>
            <InputText />
            <InputText />
            <Button>Submit</Button>
            <Button onClick={() => setShowInputFields(false)}>Cancel</Button>
          </>
        ) : (
          <></>
        )}
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
                  <div className='buttonWrapper'>
                    <Button type='button' onClick={() => createComment(post.id)}>Add comment</Button>
                    <Button onClick={() => deletePost(post.id)}>Delete post</Button>
                    <Button onClick={() => updateTitle(post.id)}>Update title</Button>
                  </div>
                </>
              ) : (
                <Button id='addComment' onClick={() => createComment(post.id)}>Add comment</Button>
              )}

            </div>
          )}
        </div>
      </>
    </div>
  );
}

export default withAuthenticator(App);
