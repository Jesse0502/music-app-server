require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const lyricsFinder = require("lyrics-finder")
const SpotifyWebApi = require("spotify-web-api-node")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const redirectUri = process.env.REDIRECT_URL
app.post("/refresh", async (req, res) => {
    try {

        const refreshToken = req.body.refreshToken
        const spotifyApi = await new SpotifyWebApi({
            redirectUri,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken,
        })
        const data = await spotifyApi?.refreshAccessToken()
        res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in,
        })
    } catch (err) {
        res.status(400).json(err)
    }
})
app.get("/callback", async (req, res) => {
    try {

        const code = req.query.code
        const spotifyApi = new SpotifyWebApi({
            redirectUri,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        })
        await spotifyApi.authorizationCodeGrant(code).then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            })

        })

    } catch (err) {
        res.json(err)
    }
})
app.post("/login", (req, res) => {
    const code = req.body.code
    console.log("login", code)
    const spotifyApi = new SpotifyWebApi({
        redirectUri,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    })

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            })
        })
        .catch(err => {
            res.json(err)
        })
})

app.get("/lyrics", async (req, res) => {
    const lyrics =
        (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
    res.json({ lyrics })
})

app.listen(3000)