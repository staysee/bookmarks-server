function makeBookmarksArray(){
    return [
        {
            id: 1,
            title: 'First test bookmark',
            url: 'https://www.google.com',
            description: 'This is the first test.',
            rating: 1
        },
        {
            id: 2,
            title: 'Second test bookmark',
            url: 'https://www.google.com',
            description: 'This is the second test.',
            rating: 2
        },
        {
            id: 3,
            title: 'Third test bookmark',
            url: 'https://www.google.com',
            description: 'This is the third test.',
            rating: 3
        }
    ]
}

module.exports = {
    makeBookmarksArray
}