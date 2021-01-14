import React from 'react';
import PropTypes from 'prop-types';

const PlayerView = props => {

    const Stream = (streamer) => {
        console.log(streamer)
        return (
            <div>
                <TwitchPlayer
                    channel={streamer}
                    id={streamer}
                    theme="dark"
                />
    
    
            </div>
        );
    }

    return (
        <div>
            {(Stream(props.streamerName))}
        </div>
    );
};

PlayerView.propTypes = {
    
};

export default PlayerView;