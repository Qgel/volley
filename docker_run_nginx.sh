#!/bin/bash
docker run -v $(pwd)/database/:/usr/src/volley/database --network nginxnw --name volley -d --restart=always volley
