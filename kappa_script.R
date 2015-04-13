library(irr)
library(jsonlite)


ratings <- fromJSON('{"user": {"Terminator": 5, "Speed": 3, "Aliens": 5, "Point Break": 2, "Red Dawn": 2, "Blond on Blond": 1}, "reviewer": {"Terminator": 4, "Speed": 2, "Aliens": 5, "Point Break": 3, "Red Dawn": 3, "Blond on Blond": 4}}')

df <- as.data.frame(do.call("cbind", ratings))

df$user <- unlist(df$user)
df$reviewer <- unlist(df$reviewer)
data <- df[,c(1,2)]
k <- kappa2(df, "equal")  # kappa2(df, "squared") for squared weights. 
k$value
