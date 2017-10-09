import React from 'react';
import Error from 'next/error';
import Link from 'next/link';
import querystring from 'querystring';
import { v4 as uuid } from 'uuid';
import { find, map, remove } from 'lodash';
import debug from 'debug';
import axios from 'axios';
import Head from '../components/head';
import Header from '../components/header';
import Drawer from '../components/drawer';
import Card from '../components/item-card';

const log = debug('app:create:log');

const baseUrl = 'https://www.omdbapi.com/';
const apiKey = 'd3d4974';
const url = `${baseUrl}?apiKey=${apiKey}`;

export default class Form extends React.Component {
    static async getInitialProps () {
        log('getInitialProps');
        const item = { name: '', movies: [] };

        return { item };
    }

    componentDidMount () {
        log('componentDidMount');
        const qs = querystring.parse(window.location.search.replace('?', ''));
        const { id } = qs;
        const { items, ratings } = JSON.parse(localStorage.getItem('app') || '{"items":[],"ratings":[]}');
        const item = id ? find(items, { id: id }) : this.props.item;

        this.setState({ id, items, ratings, item });
    }

    handleChange (event) {
        log('handleChange');
        let { item } = this.state;
        log(event.target.value);
        item.name = event.target.value;
        this.setState({ item });
        event.preventDefault();
    }

    handleSearch (event) {
        log('handleSearch');
        const search = event.target.value;

        axios.get(`${url}&t=${search}`).then(res => {
            const movie = res && res.data;
            this.setState({ search, movie });
        });
        event.preventDefault();
    }

    handleAdd (movie) {
        log('handleAdd');
        const { item } = this.state;

        if (find(item.movies, { imdbID: movie.imdbID })) return;
        item.movies.push(movie);
        this.setState({ item });
    }

    handleRemove (movie) {
        log('handleRemove');
        const { item } = this.state;

        remove(item.movies, { imdbID: movie.imdbID });
        this.setState({ item });
    }

    handleSubmit (event) {
        log('handleSubmit');
        const { items, ratings } = this.state;

        let { item } = this.state;
        log(item);

        if (!item.id) {
            item.id = uuid();
            items.push(item);
        }
        localStorage.setItem('app', JSON.stringify({ items: items, ratings: ratings }));
        event.preventDefault();
        window.location.href = '/';
    }

    render () {
        log('render');
        const items = this.state && this.state.items;
        const item = this.state && this.state.item;
        const search = this.state && this.state.search;
        const movie = this.state && this.state.movie;

        if (!items) return null;
        if (!item) return (<Error statusCode="404" />);

        return (
            <div>
                <Head />
                <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
                    <Header />
                    <Drawer />
                    <main className="mdl-layout__content">
                        <div className="page-content">
                            <form className="mdl-form" onSubmit={this.handleSubmit.bind(this)}>
                                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                    <input className="mdl-textfield__input" type="text" id="name" value={item.name} onChange={this.handleChange.bind(this)} />
                                    <label className="mdl-textfield__label" htmlFor="name">Name</label>
                                </div>

                                <br />

                                <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
                                    <label className="mdl-button mdl-js-button mdl-button--icon" htmlFor="search">
                                        <i className="material-icons">search</i>
                                    </label>
                                    <div className="mdl-textfield__expandable-holder">
                                        <input className="mdl-textfield__input" type="text" id="search" onChange={this.handleSearch.bind(this)} />
                                        <label className="mdl-textfield__label" htmlFor="search-expandable">Search Movies</label>
                                    </div>
                                </div>


                                {search && search.length && <table className="mdl-data-table mdl-data-table--selectable mdl-shadow--2dp  mdl-data-table-strech">
                                    <thead>
                                        <tr>
                                            <th colSpan={5}>Search</th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th>Title</th>
                                            <th>Year</th>
                                            <th>Genre</th>
                                            <th>Poster</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movie && <tr>
                                            <td>
                                                <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.handleAdd.bind(this, movie)}>
                                                    <i className="material-icons">add</i>
                                                </a>
                                            </td>
                                            <td>{movie.Title}</td>
                                            <td>{movie.Year}</td>
                                            <td>{movie.Genre}</td>
                                            <td><img src={movie.Poster} /></td>
                                        </tr>}
                                    </tbody>
                                </table>}

                                <br />
                                <br />

                                <table className="mdl-data-table mdl-data-table--selectable mdl-shadow--2dp mdl-data-table-strech">
                                    <thead>
                                        <tr><th colSpan={5}>Movies</th></tr>
                                        <tr>
                                            <th></th>
                                            <th>Title</th>
                                            <th>Year</th>
                                            <th>Genre</th>
                                            <th>Poster</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.movies && map(item.movies, (movie, idx) => <tr key={idx}>
                                            <td>
                                                <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.handleRemove.bind(this, movie)} >
                                                    <i className="material-icons">delete</i>
                                                </a>
                                            </td>
                                            <td>{movie.Title}</td>
                                            <td>{movie.Year}</td>
                                            <td>{movie.Genre}</td>
                                            <td><img src={movie.Poster} /></td>
                                        </tr>)}
                                    </tbody>
                                </table>

                                <br />

                                <div>
                                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Save</button>
                                </div>
                            </form>
                            <style jsx>{`
                                .mdl-form {
                                    margin: 10px;
                                }
                                .mdl-data-table--strech {
                                    width: 100%;
                                }
                                .mdl-data-table--strech img {
                                    height: 160px;
                                }
                            `}</style>
            </div>
                    </main>
            </div>
            </div>
        )
    }
}
