import React from 'react';
import Link from 'next/link';
import { v4 as uuid } from 'uuid';
import { map } from 'lodash';
import debug from 'debug';
import Head from '../components/head';
import Header from '../components/header';
import Drawer from '../components/drawer';
import Card from '../components/item-card';

const log = debug('app:log');

export default class Index extends React.Component {
    static async getInitialProps () {
        log('getInitialProps');

        return {};
    }

    componentDidMount () {
        log('componentDidMount');
        const { items } = JSON.parse(localStorage.getItem('app') || '{"items":[],"ratings":[]}');

        this.setState({ items });
    }

    render () {
        log('render');
        const items = this.state && this.state.items;

        return (
            <div>
                <Head />
                <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
                    <Header />
                    <Drawer />
                    <main className="mdl-layout__content">
                        <div className="page-content">
                            {map(items, (item, idx) => <Card id={item.id} title={item.name} bgImg={item.movies[0].Poster} key={idx} />)}

                            <a href="/form" className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored mdl-button--create">
                                <i className="material-icons">add</i>
                            </a>
                            <style jsx>{`
                                .mdl-button--create {
                                    position: absolute;
                                    bottom: 10px;
                                    right: 10px;
                                }
                            `}</style>
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}
