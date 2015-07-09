# Irr-reviews

Irr-reviews is a single-page web app that will take a user's movie reviews, fetch
reviews from Rotten Tomatoes, and then calculate inter-rater reliability (aka
*irr*, specifically, Cohen's weighted kappa, or *k*) to determine which
professional movie reviewers most share the user's tastes in movies.  Because, really,
professional movie reviewers are not normal movie fans, and we shouldn't expect
most of them to share our tastes. So find the ones that most agree with you, follow
them, and ignore the rest. I built this mostly as a project to teach myself
javascript promises, Polymer web components, and a few other things. 

Weighted kappa is a score from -1 to 1, with 1 being perfect agreement and 0 being
no agreement (relative to what would be expected by chance). See the documentation
for the [cohens-kappaJS module](https://github.com/aaronnorby/cohens-kappa-JS) for
more information on kappa statistics. 

What the app will do is take a logged set of reviews, make a series of requests to the
Rotten Tomatoes api in order to get reviews for each logged film, and then
calculate the level of agreement between the user and each film reviewer who
reviewed any of the movies that the user reviewed. 

The biggest hassle is that you need to put in a lot of reviews in order to get
meaningful results. This is because two raters need to have at least 30 ratings of
the same items to get a meaningful kappa, and not every movie is reviewed by every
reviewer---so you need to review quite a bit more than 30 movies.  

## Coarse-grained reviews

Another interesting feature of how irr-reviews calculates *k* comes from the fact
that a lot of reviewers do not give numerical ratings, and for these Rotten
Tomatoes only has a "fresh" or "rotten" score. This creates a problem for comparing
these ratings (or any ratings that are less fine-grained than 1--5) with user ratings on a 1--5 scale. 

I decided to handle this stochastically. The idea is that a review listed as
"fresh" could have been a review that maps anywhere from 2.5 to 5, and a "rotten"
review could map anywhere from below 2.5 to 1. That is, some "fresh" reviews will
have said the movie is as good as can be, and others will have said that it's just
OK. Thus, a "fresh" rating is converted to a rating on the 1-5 scale by randomly
selecting a rating between 2.5 and 5. Likewise for "rotten" reviews and any review
that has fewer than 5 categories. There are many ways that this problem could be
handled, but I think this is a pretty reasonable way. 

One consequence of course is that kappas for one and the same reviewer will not end
up the same on every try.  But, on average, across all reviewers, this should give
the most accurate agreement ratings.

Irr-reviews uses the [cohens-kappaJS module](https://github.com/aaronnorby/cohens-kappa-JS).

## Installation and usage

You need bower and node/npm. To install, clone this repository and then run both
`bower install` and `npm install` to download the few dependencies. Then, from
inside the root directory, run `node server.js`---which starts listening on port
8000---and navigate your browser to `localhost:8000`. Right now, the page will only
look right in Chrome. 

