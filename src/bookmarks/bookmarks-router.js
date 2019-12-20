const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(cards)
    })
    .post(bodyParser, (req, res) => {

    })

bookmarksRouuter
    .route('/bookmarks/:id')
    .get((req, res) => {
        
    }
    .delete((req, res) => {

    })

module.exports = bookmarksRouter