module.exports.hiddenCommandMyBoyDenzel = (message) => {
    return [{
        type: 'custom',
        message: {
            'username': 'Denzel Washington',
            'icon_url': 'https://cdn3.movieweb.com/i/article/pqK7wMOdUqjCzQzlPiWCixnt43s0VI/738:50/Three-Flight-Photos-With-Denzel-Washington.jpg',
            'attachments': [{
                'fallback': ':eyes:',
                'text': ':eyes:'
            }]
        }
    }];
}