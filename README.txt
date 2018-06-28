Volley is a webapp that tracks scores and statistics for different games and rates the performance of players using Microsofts' TrueSkill algorithm.

The backend is written in Python using pyramid with jinja2 for templating and zodb as a database.
The frontend is written in HTML/javascript with semantic ui for controls.

To run volley, either use the provided Dockerfile or run the following (preferrably inside a pyenv):
  $ pip install -e . # Install project dependencies as well as the application in develop mode
  $ pserve development.ini # Run the application. For production use the production.ini
