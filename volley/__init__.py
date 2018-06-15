from pyramid.config import Configurator
from pyramid_zodbconn import get_connection

from wsgiref.simple_server import make_server

from .models import appmaker



def root_factory(request):
    conn = get_connection(request)
    return appmaker(conn.root())


def main(global_config, **settings):
    with Configurator(root_factory=root_factory, settings=settings) as config:
        #config.include('pyramid_chameleon')
        config.include('pyramid_jinja2')
        config.add_static_view('static', 'static', cache_max_age=3600)
        config.add_route('index', '/')
        config.add_route('game', '/{game}')
        config.scan()
        app = config.make_wsgi_app()
    return app