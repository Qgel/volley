from pyramid.view import view_config

import pyramid.httpexceptions as exceptions

from .models import Context


@view_config(context=Context, renderer='templates/index.jinja2', route_name="index")
def index_view(context, request):
    game_names = sorted(list(context.games.keys()))
    return {'games': game_names}

@view_config(context=Context, renderer='templates/game.jinja2', route_name="game")
def game_view(context, request):
    game_name = request.matchdict['game'].lower()
    if not game_name in context.games:
        raise exceptions.HTTPNotFound()

    game = context.games[game_name]

    return {'game': game}
