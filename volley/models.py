from persistent.mapping import PersistentMapping
from persistent.list import PersistentList
from persistent import Persistent

from datetime import datetime

import trueskill

class Player(Persistent):

    def __init__(self, name):
        self.name = name
        # Trueskill Rating for this player
        self._rating = trueskill.Rating()
        # List of matches this player participated in
        self.matches = PersistentList()

    def set_rating(self, rating):
        self._rating = rating
        self._p_changed = True

    def get_rating(self):
        return self._rating

def Match(Persistent):

    def __init__(self, teams, score):
        self._date = datetime.now()

        self._teams = teams
        self._score = score



class Game(Persistent):
    def __init__(self, name):
        self.name = name
        # Player name -> Player
        self.players = PersistentMapping()
        # List of all matches for this game
        self.matches = PersistentList()

    def add_match(self, teams, score):
        players_a = [self.get_player(name) for name in teams[0]]
        players_b = [self.get_player(name) for name in teams[1]]

        # Add Match to the Database
        match = Match([players_a, players_b], score)
        self.matches.append(match)

        ratings_a = [p._rating for p in players_a]
        ratings_b = [p._rating for p in players_b]

        # Sort by score and get rank indices
        rank = list(zip(score, range(len(score))))
        rank.sort(key = lambda r: r[0], reverse=True)
        rank_indices = list(zip(*rank))[1]

        # Calculate new Ratings using trueskill algorithm
        new_ratings = trueskill.rate([ratings_a, ratings_b], ranks=rank_indices)

        for r,p in zip(new_ratings[0], players_a):
            p.set_rating(r)
            p.matches.append(match)

        for r, p in zip(new_ratings[1], players_b):
            p.set_rating(r)
            p.matches.append(match)


    def get_player(self, name):
        if not name in self.players:
            self.players[name] = Player(name)

        return self.players[name]

class Context(PersistentMapping):
    __parent__ = __name__ = None

    def __init__(self):
        self.games = PersistentMapping()
        self.games["volleyball"] = Game("Volleyball")

def appmaker(zodb_root):
    if not 'app_root' in zodb_root:
        app_root = Context()
        zodb_root['app_root'] = app_root
        import transaction
        transaction.commit()
    return zodb_root['app_root']
