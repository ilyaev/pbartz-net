Right now i am listening song '%TRACK%' by '%ARTIST%' on Spotify and want to know more about this song and artist.
What is some real interesting, historical and cultural facts about this track and/or album, artist? Get only real facts, don't invent artificial stories about songs and artists.
Give response in english language in JSON format with keys:
    description,
    facts,
    genres,
    similar_tracks (objects with keys: artist,title,album).
JSON should be valid, with '"' characters properly escaped. Last item in array should be without coma in the end.