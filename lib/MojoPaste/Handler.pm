package MojoPaste::Handler;

use strict;
use warnings;

use JSON;
use Syntax::Highlight::Engine::Kate;
use base 'MojoPaste::Controller';

# renders templates/handler/root.html.epl
sub root {}

# post only, 
sub newpaste {
    my $self = shift;

    # name, paste, syntax, title
    my $p = $self->req->params->to_hash;

    my @x = split( /\n/, $p->{paste} || '' );
    my $lines = scalar( @x );

    my $hl = Syntax::Highlight::Engine::Kate->new(
        language => $p->{syntax} eq '' ? 'HTML' : $p->{syntax},
        substitutions => {
            '<' => '&lt;',
            '>' => '&gt;',
            '&' => '&amp;',
            ' ' => '&nbsp;',
            "\t" => '&nbsp;&nbsp;&nbsp;&nbsp;',
            "\n" => "\n",
        },
        format_table => {
            Alert => ['<span style="color:#0000ff">', '</span>'],
            BaseN => ['<span style="color:#007f00">', '</span>'],
            BString => ['<span style="color:#c9a7ff">', '</span>'],
            Char => ['<span style="color:#ff00ff">', '</span>'],
            Comment => ['<span style="color:#7f7f7f;font-style:italic;">', '</span>'],
            DataType => ['<span style="color:#0000ff">', '</span>'],
            DecVal => ['<span style="color:#00007f">', '</span>'],
            Error => ['<span style="color:#ff0000;font-weight:bold;font-style:italic;">', '</span>'],
            Float => ['<span style="color:#00007f">', '</span>'],
            Function => ['<span style="color:#007f00">', '</span>'],
            IString => ['<span style="color:#ff0000">', ''],
            Keyword => ['<span style="font-weight:bold">', '</span>'],
            Normal => ['<span>', '</span>'],
            Operator => ['<span style="color:#ffa500">', '</span>'],
            Others => ['<span style="color:#b03060">', '</span>'],
            RegionMarker => ['<span style="color:#96b9ff;font-style:italic;">', '</span>'],
            Reserved => ['<span style="color:#9b30ff;font-weight:bold">', '</span>'],
            String => ['<span style="color:#ff0000">', '</span>'],
            Variable => ['<span style="color:#0000ff;font-weight:bold">', '</span>'],
            Warning => ['<span style="color:#0000ff;font-weight:bold;font-style:italic;">', '</span>'],
        },
    );

    my $html = $hl->highlightText( $p->{paste} );
    chomp( $html );

    $self->db->insert( 'posts', {
        post_html => $html,
        post_data => $p->{paste},
        post_name => $p->{name},
        post_syntax => $p->{syntax},
        post_title => $p->{title},
        post_lines => $lines,
        post_excerpt => substr( $p->{paste}, 0, 60 ),
    });

    my $post_id = $self->db->query("SELECT last_insert_rowid()")->list;

    # {"errors": {}, "uri": "\/2625\/", "success": true, "title": "test"}
    $self->render( action => 'response', format => 'json', json_out => {
        errors => {},
        success => JSON::true,
        uri => "/$post_id/",
        title => $p->{title} || '',
    });
}

# renders templates/handler/recent.html.epl
sub recent {
    my $self = shift;

    $self->render(
        action => 'recent',
        posts => [ $self->db->query( 'SELECT * FROM posts ORDER BY post_timestamp DESC LIMIT 5' )->hashes ]
    );
}

sub search {
    my $self = shift;

    my $p = $self->req->params->to_hash;
    # limit, query, start

    return 1 unless defined $p->{limit} && $p->{limit} =~ /^\d+$/;
    return 1 unless defined $p->{start} && $p->{start} =~ /^\d+$/;
    
    my ( $num ) = $self->db->query( 'SELECT COUNT(*) FROM posts WHERE post_data LIKE ? OR post_title LIKE ?', '%'.$p->{query}.'%', '%'.$p->{query}.'%' )->list;

    my @data;
    if ( $num && $num > 0 ) {
        # could use row as foo here
        foreach my $r (
            $self->db->query( 'SELECT * FROM posts WHERE post_data LIKE ? OR post_title LIKE ? LIMIT '.$p->{start}.','.$p->{limit}, '%'.$p->{query}.'%', '%'.$p->{query}.'%' )->hashes
        ) {
            push( @data, {
                excerpt => $r->{post_excerpt},
                name => $r->{post_name},
                title => $r->{post_title},
                uri => '/'.$r->{post_id}.'/',
                timestamp => $r->{post_timestamp},
            });
        }
    }

    $self->render( action => 'response', format => 'json', json_out => {
        totalCount => $num,
        items => \@data,
    });
}

sub fetch {
    my $self = shift;

    my $id = $self->stash( 'id' );
    my $type = $self->stash( 'type' );
    my $mode = $self->stash( 'mode' );

    my $data = $self->db->query( 'SELECT * FROM posts WHERE post_id=?', $id )->hash;

    if ( $mode eq 'popup' ) {
        $self->res->headers->header( 'Content-Type' => 'text/plain' );
        $self->res->body( $data->{post_data} );
    } elsif ( $type eq 'raw' ) {
        $self->res->headers->header( 'Content-Disposition' => 'attachment; filename="mojopaste_'.$data->{post_id}.'"' );
        $self->res->headers->header( 'Content-Type' => 'application/octet-stream' );
        $self->res->body( $data->{post_data} );
    } else {
        $self->render( action => 'fetch', %$data );
    }
}

sub lexers {
    my $self = shift;

    my $hl = Syntax::Highlight::Engine::Kate->new();

    my @lexers = sort { $a cmp $b } map { $_ } keys %{$hl->{syntaxes}};

    # renders templates/handler/lexers.json.epl
    $self->render(
        action => 'response',
        format => 'json',
        json_out => {
            'totalCount' => scalar @lexers,
            'items' => [ map { { syntax => $_ } } @lexers ]
        }
    );
}

1;
