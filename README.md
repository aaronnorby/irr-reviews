# Irr-reviews

Irr-reviews will fetch reviews from Rotten Tomatoes and then use inter-rater
reliability (aka *irr*, specifically, Cohen's weighted kappa) to determine which
professional movie reviewers most share your tastes in movies.  Because, really,
professional movie reviewers are not normal movie fans, and we shouldn't expect
most of them to share our tastes. So find the ones that most agree with you, follow
them, and ignore the rest. 

There's no real interface right now. But, basically, it takes an object containing
user reviews (of the `'movieTitle': rating` form), gets the reviews for each of
those movies, and then calculates Cohen's weighted kappa for each reviewer that's
reviewed more than one of the movies in the user's reviews. 

Irr-reviews uses the [cohens-kappaJS module](https://github.com/aaronnorby/cohens-kappa-JS).

