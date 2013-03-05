flinder
=======

Connect with mutually unattractive people.

* * * * *
* ABOUT *
* * * * *

This project showcases my fake product, Flinder, a parody of the
popular iPhone app, Tinder, which matches users to mutually
attractive people.

Flinder is not a completed project but has the following
features:

* Showcases fake user profiles extracted from a preselected set
  of scraped Match.com information
* Dynamically and fluidly animates sliding content pages left and
  right
* Additional animation for expanding buttons created from vector
  graphics drawing library, RaphaelJS
* Data mining code written in Python to extract fake user
  profiles
* Name generating code to pull names randomly without duplicates
  from a file according to a weighted probability distribution
* Static "About" and "FAQ" pages featuring well-thought (simple)
  typographic considerations.
* Relies on additional external libraries jquery and, to a
  minimal extent, Bootstrap.

There is a lot left to do if this were to ever be turned into a
completed project, and a lot of time spent on this project was
in the minor features such as fluidly expanding buttons and
smooth page transitions. For the purposes of this comp, obviously
a completely finished website is not expected; there is much I
would have added and polished given additional time.

NOTE: Intended to be viewed in Google Chrome on a decently
widescreen display (> 1000px width-wise)

* * * * *
* FILES *
* * * * *

index.html
----------
The main html page for Flinder. The bulk of the user interaction
takes place on this page and associated javascript files.

about.html, faq.html
--------------------
Very basic and unfunny pages mainly intended to showcase static
text typography. Little effort was invested in creating
content for these pages.

js/flinder.js
-------------
The main javascript file for Flinder. Interfacing with external
javascript library RaphaelJS, this file is responsible for
dynamically drawing the expanding circle navigation system of
Flinder, transitioning between slides, changing content in the
main content page dynamically, grabbing match.com profiles from
a json file (see match_data.json below), and expanding
thumbnail images.

js/pages.js
-----------
Stores html data for pages to be dynamically swapped when the
user navigates left and right without loading a new page. Used
by flinder.js.

css/main.css
------------
The css file for the entire project. Self-explanatory (all text-
based measurements conducted in em's).

python/match.py
---------------
Python code that logs into Match.com with a fake profile,
initiates a search for women between the ages of 18 and 35 within
50 miles of Cambridge, then proceeds to scrape the results of
the search queries. Extremely creepy and likely illegal.

python/name_gen.py
------------------
Script that generates random names according to the weighted
probability file, python/female_names.txt.

python/match_data.json
----------------------
Generated programmatically with match.py, this file stores the
results of the scraping of profiles on match.py.

python/request
--------------
Directory that stores essential headers and post data for the web
requests that match.py uses.

img/cropped_profiles
--------------------
Directory storing profile images pulled from the match.py script.
These images were programmatically cropped to an aspect ratio
of 1x1 and scaled to 300x300px.

Dylan Freedman
March 4, 2013
