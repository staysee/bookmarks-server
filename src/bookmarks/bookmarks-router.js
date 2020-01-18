const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
  })

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    // .post(bodyParser, (req, res, next) => {
    //     const { title, url, description, rating } = req.body;
    //     const newBookmark = { title, url, description, rating }
        
    //     for (const [key, value] of Object.entries(newBookmark)){
    //         if (value == null)
    //             return res.status(400).json({
    //                 error: { message: `Missing '${key}' in request body`}
    //             })
    //     }

    //     const ratingNum = Number(rating)

    //     if (!Number.isInteger(ratingNum) || Number(ratingNum)<0 || Number(ratingNum)>5 ){
    //         logger.error(`Invalid rating: ${rating}`)
    //         return res
    //             .status(400)
    //             .send({
    //                 error: { message: `Invalid rating`}
    //             })
    //     }

    //     if (!isWebUri(url)) {
    //         logger.error(`Invalid url '${url}' supplied`)
    //         return res.status(400).send({
    //           error: { message: `Invalid url` }
    //         })
    //       }


    //     const knexInstance = req.app.get('db')
    //     BookmarksService.insertBookmark(knexInstance, newBookmark)
    //         .then(bookmark => {
    //             logger.info(`Bookmark with id ${bookmark.id} created.`)
    //             res
    //                 .status(201)
    //                 .location(`/bookmarks/${bookmark.id}`)
    //                 .json(serializeBookmark(bookmark))
    //         })
    //         .catch(next)
    // })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'url', 'rating']) {
          if (!req.body[field]) {
            logger.error(`${field} is required`)
            return res.status(400).send({
              error: { message: `Missing '${field}' in request body` }
            })
          }
        }
    
        const { title, url, description, rating } = req.body
    
        const ratingNum = Number(rating)
    
        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
          logger.error(`Invalid rating '${rating}' supplied`)
          return res.status(400).send({
            error: { message: `'rating' must be a number between 0 and 5` }
          })
        }
    
        if (!isWebUri(url)) {
          logger.error(`Invalid url '${url}' supplied`)
          return res.status(400).send({
            error: { message: `Invalid url` }
          })
        }
    
        const newBookmark = { title, url, description, rating }
    
        BookmarksService.insertBookmark(
          req.app.get('db'),
          newBookmark
        )
          .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created.`)
            res
              .status(201)
              .location(`/bookmarks/${bookmark.id}`)
              .json(serializeBookmark(bookmark))
          })
          .catch(next)
      })

bookmarksRouter
    .route('/:id')
    .get((req, res, next) => {
        const { id } = req.params
        const bookmark = bookmarks.find( b => b.id == id)
        const knexInstance = req.app.get('db')

        BookmarksService.getById(knexInstance, id)
            .then(bookmark => {
                if(!bookmark){
                    logger.error(`Bookmark with id ${id} not found`)
                    return res
                        .status(404)
                        .json({ error: { message: `Bookmark not found.` }})
                }
                res.json(serializeBookmark(bookmark))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { id } = req.params
        BookmarksService.deleteBookmark(knexInstance, id)
            .then( () => {
                logger.info(`Bookmark with id ${id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter