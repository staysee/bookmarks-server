const express = require('express')
const xss = require('xss')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url')
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
    rating: Number(bookmark.rating)
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
    .post(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body;
        const newBookmark = {
            title, 
            url,
            description,
            rating
        }

        for (const [key, value] of Object.entries(newBookmark)){
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
        }

        if(!isWebUri(url)){
            logger.error(`Invalid url: '${url}'`)
            return res
                .status(400)
                .send({
                    error: { message: `Invalid url`}
                })
        }

        if (isNaN(rating) || rating<0 || rating>5 ){
            logger.error(`Invalid rating: ${rating}`)
            return res
                .status(400)
                .send({
                    error: { message: `Invalid rating`}
                })
        }

        const knexInstance = req.app.get('db')
        BookmarksService.insertBookmark(knexInstance, newBookmark)
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