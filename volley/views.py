from pyramid.view import view_config, notfound_view_config
from pyramid.compat import escape
from pyramid.response import Response

import pyramid.httpexceptions as exceptions

from itertools import combinations, groupby

from .models import Context, Match

@notfound_view_config(append_slash=True)
def notfound(request):
    return exceptions.HTTPNotFound()

def get_game(context, name):
    """
    :param context: The ORM context
    :param name: The name of the game
    :return: The game, or raises a HTTPNotFound if no game of that name exists.
    """
    game_name = name.lower()
    if not game_name in context.games:
        raise exceptions.HTTPNotFound()

    return context.games[game_name]

@view_config(context=Context, route_name="index")
def index_view(context, request):
    game_names = list(context.games.keys())
    return exceptions.HTTPFound("/{}/".format(game_names[0]))

@view_config(context=Context, renderer='templates/game.jinja2', route_name="game")
def game_view(context, request):
    game = get_game(context, request.matchdict['game'])
    matches = sorted(game.matches, key = lambda m: m.date, reverse=True)
    players = sorted(game.players.values(), key = lambda p: p.exposure(), reverse=True)
    all_games = [g.name for g in context.games.values()]
    return {'game': game, 'matches' : matches, 'players' : players, 'all_games' : all_games}

@view_config(context=Context, renderer='templates/matchmaking.jinja2', route_name="matchmaking")
def matchmaking_view(context, request):
    game = get_game(context, request.matchdict['game'])
    all_games = [g.name for g in context.games.values()]

    pairings = []
    players = []
    if 'players' in request.params:
        player_names = [escape(s) for s in request.params['players'].split(',')]
        players = [game.players[p] for p in player_names if p in game.players]

        def make_pairing(t1):
            t2 = [p for p in players if p not in t1]
            quality = Match.draw_probability(t1, t2)
            return {'team1': t1, 'team2': t2, 'quality': quality}

        # Calculate match quality for all team compositions
        for split in range(1, int(len(players)/2)):
            for t1 in combinations(players, split):
                pairings.append(make_pairing(t1))

        # Half-Half point with even players needs special handling, because otherwise we will generate
        # The same teams multiple times (e.g. AB vs CD and CD vs AB)
        halfside = list(combinations(players, int(len(players)/2)))
        if len(players) % 2 == 0:
            halfside = halfside[:int(len(halfside)/2)]
        for t1 in halfside:
            pairings.append(make_pairing(t1))

        pairings.sort(key=lambda p: p['quality'], reverse=True)

    # Group painings by thresholds for display
    pairings_good = [p for p in pairings if p['quality'] > 0.4]
    pairings_ok = [p for p in pairings if p['quality'] >= 0.1 and not p in pairings_good]
    pairings_bad = [p for p in pairings if not p in pairings_good and not p in pairings_ok]

    return {'game': game, 'all_games' : all_games, 'players' : players,
            'pairings_good' : pairings_good, 'pairings_ok' : pairings_ok, 'pairings_bad' : pairings_bad}

@view_config(context=Context, renderer='templates/playerpage.jinja2', route_name="playerpage")
def playerpage_view(context, request):
    game = get_game(context, request.matchdict['game'])
    all_games = [g.name for g in context.games.values()]

    player_name = request.matchdict['player']
    if not player_name in game.players:
        raise exceptions.HTTPNotFound()
    player = game.players[player_name]

    players = sorted(game.players.values(), key=lambda p: p.exposure(), reverse=True)
    player_rank = players.index(player) + 1

    connectivity = {}
    for p in players:
        team_matches = [m for m in player.matches if (p in m.teams[0] and player in m.teams[0]) or (p in m.teams[1] and player in m.teams[1])]
        name = p.name
        # For ourselves, look at solo games
        if p == player:
            team_matches = [m for m in player.matches if (p in m.teams[0] and len(m.teams[0]) == 1) or (p in m.teams[1] and len(m.teams[1]) == 1)]
            name = "Solo"

        num_won = len([m for m in team_matches if m.won(player)])
        win_rate = (num_won / len(team_matches)) if len(team_matches) > 0 else 0.0
        stats = {'num_played_together' : len(team_matches),
                 'num_won' : num_won,
                 'win_rate' : win_rate}

        connectivity[name] = stats

    opponents = set()
    for m in player.matches:
        opponent_team = m.teams[0] if player in m.teams[1] else m.teams[1]
        opponents.update(opponent_team)
    num_played_opponents = len(opponents)

    wins = [m.won(player) for m in player.matches]
    def find_streak(v):
        return max(sum([1 for _ in run]) for val,run in groupby(wins) if (val == v))
    longest_winstreak = find_streak(True)
    longest_lossstreak = find_streak(False)

    return {'game': game, 'all_games' : all_games, 'player' : player, 'connectivity' : connectivity,
           'player_rank' : player_rank, 'num_played_opponents' : num_played_opponents,
            'longest_winstreak' : longest_winstreak, 'longest_lossstreak' : longest_lossstreak}

@view_config(context=Context, route_name="match_add")
def game_add(context, request):
    team_a = [escape(s) for s in request.params['team_a'].split(',')]
    team_b = [escape(s) for s in request.params['team_b'].split(',')]

    try:
        score_a = int(request.params['score_a'])
        score_b = int(request.params['score_b'])
    except ValueError:
        return Response(body='Invalid score value!', status='406 Not Acceptable')

    if score_a < 0 or score_b < 0:
        return Response(body='Score may not be negative!', status='406 Not Acceptable')

    for p in (team_a + team_b):
        if p == "":
            return Response(body='Player name may not be empty!', status='406 Not Acceptable')

    # Check if players on each team are unique
    for player_a in team_a:
        if player_a in team_b:
            return Response(body='Player {} appears in both teams!'.format(player_a), status='406 Not Acceptable')

    game = get_game(context, request.matchdict['game'])
    game.add_match([team_a, team_b], [score_a, score_b])

    return Response(status='200 OK')

@view_config(context=Context, route_name="match_delete")
def match_delete(context, request):
    uuid = request.params['id']
    game_name = request.matchdict['game']
    game = get_game(context, game_name)

    match = [m for m in game.matches if str(m.uuid) == uuid]
    if len(match) != 1:
        raise exceptions.HTTPNotFound

    game.delete_match(match[0])

    return exceptions.HTTPFound("/{}/".format(game_name))






