package MojoPaste;

use strict;
use warnings;

use DBIx::Simple;

use base 'Mojolicious';

our $root;

sub process {
    my ( $self, $c ) = @_;

    my $db = DBIx::Simple->connect( "dbi:SQLite:dbname=$root/db/mojopaste.db" )
        or die DBIx::Simple->error;

    $c->db( $db );

    $self->dispatch( $c );
}

# This method will run once at server start
sub startup {
    my $self = shift;
    
    $root = $self->home;
    
    my $db = DBIx::Simple->connect( "dbi:SQLite:dbname=$root/db/mojopaste.db" )
        or die DBIx::Simple->error;

    my ( $setup ) = $db->query("PRAGMA table_info( posts )")->list;

    unless ( defined $setup ) {
        $self->log->info('database not initialized, creating tables');
        $db->query(qq|
            CREATE TABLE posts (
                post_id INTEGER PRIMARY KEY,
                post_lines INTEGER NOT NULL,
                post_data text NOT NULL,
                post_html text NOT NULL,
                post_timestamp timestamp NOT NULL default CURRENT_TIMESTAMP,
                post_syntax varchar(50) NULL,
                post_excerpt varchar(60) NOT NULL,
                post_name varchar(50) NULL,
                post_title varchar(255) NOT NULL
            )
        |) or die DBIx::Simple->error;
    }

    # custom controller with db attribute
    $self->controller_class( 'MojoPaste::Controller' );

    my $r = $self->routes;

    # root
    $r->route( '/' )->to( controller => 'handler', action => 'root' );
    
    # new paste
    $r->route( '/new' )->via( 'post' )->to( controller => 'handler', action => 'newpaste' );

    # recent pastes
    $r->route( '/recent' )->to( controller => 'handler', action => 'recent' );
    
    # lexers
    $r->route( '/lexers/json' )->to( controller => 'handler', action => 'lexers' );
    
    # paste search
    $r->route( '/search/json' )->to( controller => 'handler', action => 'search' );

    # pastes
    $r->route( '/:id/:type/:mode', id => qr/\d+/ )->to( controller => 'handler', action => 'fetch', type => '', mode => '' );
}

1;
