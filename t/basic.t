#!/usr/bin/env perl

use strict;
use warnings;

use Mojo::Client;
use Mojo::Transaction;
use Test::More tests => 4;

use_ok('MojoPaste');

# Prepare client and transaction
my $client = Mojo::Client->new;
my $tx     = Mojo::Transaction->new_get('/');

# Process request
$client->process_app('MojoPaste', $tx);

# Test response
is($tx->res->code, 200);
is($tx->res->headers->content_type, 'text/html');
like($tx->res->content->file->slurp, qr/Mojo Paste/i);
