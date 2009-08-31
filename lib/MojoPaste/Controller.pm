package MojoPaste::Controller;

use strict;
use warnings;

use base 'Mojolicious::Controller';

__PACKAGE__->attr([ 'db' ]);

sub new {
    shift->SUPER::new( @_ );
}

1;
