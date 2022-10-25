import React, {useState} from 'react';
import Post from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import {useMediaQuery} from "react-responsive";
import About from "../../components/About/About";
import PostModel from "../../models/Post"
import useInView from 'react-cool-inview'
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {loadMorePosts, pollPosts} from "../../store/homeSlice";
import {ResharedPost} from "../../models/Post";
import PillModal from "../../components/PillModal/PillModal";
import { PencilIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css'
import "./Home.css"
import {getUseMultiColumn} from "../../utils/SettingsStorage";

const InfiniteScrollBefore = 5

const Home = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(state => state.home.posts)
  const loading = useAppSelector(state => state.home.loading)
  const loadingMore = useAppSelector(state => state.home.loadingMore)
  const noMore = useAppSelector(state => state.home.noMore)
  const me = useAppSelector(state => state.me.me)

  const [resharePostData, updateResharePostData] = useState<PostModel | ResharedPost | null>(null)
  const [mobileNewPostOpened, updateMobileNewPostOpened] = useState(false)

  const isMobile = useMediaQuery({query: '(max-width: 750px)'})
  const { observe } = useInView({
    rootMargin: "50px 0px",
    onEnter: async ({ unobserve, observe }) => {
      unobserve()
      await dispatch(loadMorePosts())
      observe()
    }
  })

  const leftColumnsContent = () => {
    if (loading || !me) {
      return (
        <div className="home-status">Loading...</div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="home-status">No posts here</div>
      )
    }

    let postElements = []
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      let isInfiniteScrollTrigger = false
      if (posts.length > InfiniteScrollBefore) {
        isInfiniteScrollTrigger = i === posts.length - InfiniteScrollBefore
      } else {
        isInfiniteScrollTrigger = i === posts.length - 1
      }
      postElements.push(
        <div
          // need to use post ID instead of index as key
          // otherwise comments and reactions will be shifted after a new post is prepended
          key={post.id}
          ref={isInfiniteScrollTrigger ? observe : null}
        >
          <Post
            data={post}
            me={me}
            detail={false}
            hasNewPostModal={isMobile}
            updateResharePostData={updateResharePostData}
            updateNewPostOpened={updateMobileNewPostOpened}
          />
        </div>
      )
    }
    let endElem;
    if (noMore) {
      endElem = (
        <div
          key={posts.length}
          className='home-load-more home-load-more-disabled'
        >No more new posts</div>
      )
    }
    else if (loadingMore) {
      endElem = (
        <div
          key={posts.length}
          className='home-load-more home-load-more-disabled'
        >Loading...</div>
      )
    } else {
      endElem = (
        <div
          key={posts.length}
          className='home-load-more'
          onClick={async () => {
            await dispatch(loadMorePosts())
          }}
        >Load more</div>
      )
    }
    postElements.push(endElem)

    return (
      <Masonry
        breakpointCols={getUseMultiColumn() ? {
          default: 4,
          3350: 4,
          2450: 3,
          1650: 2,
          950: 1,
        } : 1}
        className="home-posts-masonry-grid"
        columnClassName="home-posts-masonry-grid_column"
      >
        {postElements}
      </Masonry>
    )
  }

  const newPostElem = (
    <NewPost
      resharePostData={resharePostData}
      updateResharePostData={updateResharePostData}
      beforePosting={() => {
        updateMobileNewPostOpened(false)
      }}
      afterPosting={async () => {
        await dispatch(pollPosts())
      }}
    />
  )

  return (
    <div className="home-wrapper">
      <div
        className={getUseMultiColumn() ?
          'home-posts-wrapper home-posts-wrapper-multi' :
          'home-posts-wrapper'
        }
      >
        {leftColumnsContent()}
      </div>
      {isMobile ?
        <>
          <div
            className='mobile-new-post-button'
            onClick={() => updateMobileNewPostOpened(true)}
          >
            <PencilIcon />
          </div>
          <PillModal
            isOpen={mobileNewPostOpened}
            onClose={() => {updateMobileNewPostOpened(false)}}
            title="New post"
          >
            {newPostElem}
          </PillModal>
        </> :
        <div className={getUseMultiColumn() ?
          'home-right-column-container home-right-column-container-multi' :
          'home-right-column-container'
        }>
          <div className="home-right-column-new-post-wrapper">
            {newPostElem}
          </div>
          <NotificationDropdown />
          <About/>
        </div>
      }
    </div>
  )
}

export default Home
