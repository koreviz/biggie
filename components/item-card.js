import React from 'react';
import Link from 'next/link';

export default ({id, title, text, bgImg}) =>
    <div className="mdl-card mdl-shadow--2dp mdl-card--item">
        <div className="mdl-card__title mdl-card--expand mdl-card__title--bg">
            <h2 className="mdl-card__title-text">{title}</h2>
        </div>
        {/* <div className="mdl-card__supporting-text">{text}</div> */}
        <div className="mdl-card__actions mdl-card--border">
            <a href={`/item?id=${id}`} className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                View
            </a>
        </div>
        <style jsx>{`
            .mdl-card--item {
                margin: 10px;
            }
            .mdl-card__title--bg {
                background-color: #46b6ac;
            }
            .mdl-card__title--bg > .mdl-card__title-text {
                color: white;
            }
        `}</style>
    </div>
