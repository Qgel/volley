#!/bin/bash
docker run --rm -v $(pwd)/database/:/usr/src/volley/database -p 6543:6543 --name volley -it volley
