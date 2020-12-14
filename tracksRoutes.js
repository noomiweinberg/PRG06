let express = require('express')
const { where } = require('../models/trackModel')


let Track = require('../models/trackModel')

let router = () => {

    let tracksRouter = express.Router()

    //CORS headers collectie
    tracksRouter.use('/tracks', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        next()
    })

    tracksRouter.use('/tracks', (req, res, next) => {
        let acceptType = req.get("Accept")

        if (acceptType == "application/json") {
            next()
        } else {
            //geen next
            //stuur foutmelding
            //200 - alles is goed
            //400 - de gebruiker doet iets verkeerd <=
            //500 - de server doet iets verkeerd
            res.status(400).send()
        }
    })

    //GET all tracks
    tracksRouter.get('/tracks', async (req, res) => {
        
        try {
            // Pagination
            const page = parseInt(req.query.start) 
            const limit = parseInt(req.query.limit)


            let tracks = await Track.find()
            .limit(limit * 1)
            .skip((page -1) * limit)
            .exec()

            const count = await Track.countDocuments()

            let tracksCollection = {
                "items": [],
                "_links": {
                    "self": { "href": "http://" + req.headers.host + "/api/tracks" },
                    "collection": { "href": "http://" + req.headers.host + "/api/tracks" }
                }
            }

            for (let track of tracks) {
                console.log(track)
                let trackItem = track.toJSON()

                trackItem._links =
                {
                    "self": { "href": "http://" + req.headers.host + "/api/tracks/" + trackItem._id },
                    "collection": { "href": "http://" + req.headers.host + "/api/tracks" }
                }

                tracksCollection.items.push(trackItem)
            }

            tracksCollection.pagination = {
                "currentPage": page,
                "currentItems": tracksCollection.items.length, 
                "totalPages": Math.ceil(count / limit),
                "totalItems": count
            }

            let startUrl = "http://" + req.headers.host + "/api/tracks"
            let limitUrl = "&limit=" + limit
            let firstUrl
            let lastUrl
            let previousUrl
            let nextUrl

            if (req.query.start) {
                console.log(page)
                firstUrl = startUrl + "?start=1&limit=" + limit
                lastUrl = startUrl + "?start=" + Math.ceil(count / limit) + limitUrl

                previousUrl = page == 1 ? firstUrl : startUrl + "?start=" + parseInt(page - 1) + limitUrl

                nextUrl = page > Math.ceil(count / limit) ? lastUrl : startUrl + "?start=" + parseInt(page + 1) + limitUrl

            } else {
                firstUrl = startUrl
                lastUrl = startUrl
                previousUrl = startUrl
                nextUrl = startUrl
            }


            tracksCollection.pagination._links =
            {
                "first": {
                    "page": 1,
                    "href": firstUrl, 
                },
                "last": {
                    "page": Math.ceil(count / limit),
                    "href": lastUrl
                },
                "previous": {
                    "page": page - 1,
                    "href": previousUrl
                },
                "next": {
                    "page": page + 1,
                    "href": nextUrl
                }
            }

            res.json(tracksCollection)

        } catch (err) {
            res.status(500).send(err)
        }
    })

    //POST track

    tracksRouter.route('/tracks')

    .post(function(req, res) {
        console.log ("Starting: POST ID")
        const track = new Track({
            title: req.body.title,
            artist: req.body.artist,
            genre: req.body.genre,
            release: req.body.release,
            duration: req.body.duration
        });

        if (req.body.title && req.body.artist && req.body.artist && req.body.genre && req.body.release && req.body.duration) {
        track.save(function (err) {
        res.status(201).send(track);
    });
        } else {
            res.status(400).send()
        }
        
})

    // Options for collection
    tracksRouter.options('/tracks', (req, res) => {
        console.log("requested options")
        res.header("Allow", "POST, GET, OPTIONS")
        res.header("Access-Control-Allow-Methods", 'POST, GET, OPTIONS').send()
        
    })

    // GET one track
    tracksRouter.get('/tracks/:id', getTrack, (req, res) => {
        let track = res.track.toJSON()

        track._links = {
            "self": {"href": "http://" + req.headers.host + "/api/tracks/" + track._id},
            "collection": {"href": "http://" + req.headers.host + "/api/tracks"}
        }

        res.json(track)

    })

    // DELETE track
    tracksRouter.delete('/tracks/:id', getTrack, async (req, res) => {
        try {
            await res.track.remove()
            res.status(204).send({ message: 'Track is deleted' })
         } catch (err) {
            res.status(500).send({ message: err.message })
        }
    })


    // Update track with PUT
    tracksRouter.put('/tracks/:id', function(req,res,next){
        Track.findByIdAndUpdate({_id: req.params.id}, req.body).then(function(){
            Track.findOne({_id: req.params.id}).then(function(track){
                if (req.body.title && req.body.artist && req.body.artist && req.body.genre && req.body.release && req.body.duration) {
                    res.send(track);
                    res.status(201).send(track);
            
                    } else {
                        res.status(400).send()
                    }
            
            });
        });
    });


    // Options for one track
    tracksRouter.options('/tracks/:id', (req, res) => {
        console.log("requested options")
        res.header("Allow", "DELETE, GET, PUT, OPTIONS")
        res.header("Access-Control-Allow-Methods", 'DELETE, GET, PUT, OPTIONS').send()
    })

    //Find track by ID
    async function getTrack(req, res, next) {
        let track
        try {
            track = await Track.findById(req.params.id)
            if (track == null) {
                return res.status(404).send({ message: 'Cannot find track' })
            }
        } catch {
            return res.status(500).send({ message: err.message })
        }

        res.track = track
        next()
    }

    return tracksRouter

}

module.exports = router