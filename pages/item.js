import React from 'react';
import Error from 'next/error';
import Link from 'next/link';
import querystring from 'querystring';
import { clone, includes, filter, find, map, reduce, reverse, sortBy } from 'lodash';
import debug from 'debug';
import axios from 'axios';
import Head from '../components/head';
import Header from '../components/header';
import Drawer from '../components/drawer';
import Card from '../components/item-card';

const log = debug('app:list:log');

export default class Item extends React.Component {
    static async getInitialProps () {
        log('getInitialProps');
        const item = { name: '', movies: [], _movies: [], _rating: 0 };

        return { item };
    }

    componentDidMount () {
        log('componentDidMount');
        const qs = querystring.parse(window.location.search.replace('?', ''));
        const { id } = qs;
        const { items, ratings } = JSON.parse(localStorage.getItem('app') || '{"items":[],"ratings":[]}');
        const item = id ? find(items, { id: id }) : this.props.item;

        if (item) item._movies = clone(item.movies);
        this.setState({ items, ratings, item });
    }

    reduceItem (item, ratings) {
        log('reduceItem');

        return reduce(item.movies, (memo, movie) => {
            const rating = find(ratings, { imdbID: movie.imdbID });
            memo += (rating && rating.val) || 0;
            return memo;
        }, 0) / item.movies.length;
    }

    reduceMovie (movie, ratings) {
        log('reduceMovies');
        const rating = find(ratings, { imdbID: movie.imdbID });

        return (rating && rating.val) || 0;
    }

    handleSearch (event) {
        log('handleSearch');
        const { item } = this.state;
        const search = event.target.value;

        item._movies = search && search.length ? filter(item.movies, movie => includes(movie.Title, search)) : clone(item.movies);
        this.setState({ item });
        event.preventDefault();
    }

    handleSort (type, event) {
        log('handleSort');
        const { item } = this.state;
        let { sort } = this.state;

        if (type !== this.state.type) sort = 0;
        else sort = !sort;
        sortBy(item._movies, type);
        if (type === this.state.type) reverse(item._movies);
        this.setState({ item, sort, type });
        event.preventDefault();
    }

    handleUp (movie) {
        log('handleUp');
        const { items, ratings, item } = this.state;
        let rating = find(ratings, { imdbID: movie.imdbID });

        if (!rating) {
            rating = { imdbID: movie.imdbID, val: 1 };
            ratings.push(rating);
        }
        else rating.val += 1;
        localStorage.setItem('app', JSON.stringify({ items: items, ratings: ratings }));
        this.setState({ ratings });
    }

    handleDown (movie) {
        log('handleDown');
        const { items, ratings, item } = this.state;
        let rating = find(ratings, { imdbID: movie.imdbID });

        if (!rating.val) return;
        rating.val -= 1;
        localStorage.setItem('app', JSON.stringify({ items: items, ratings: ratings }));
        this.setState({ item, ratings });
    }

    render () {
        log('render');
        const items = this.state && this.state.items;
        const item = this.state && this.state.item;
        const ratings = this.state && this.state.ratings;
        const type = this.state && this.state.type;
        const sort = this.state && this.state.sort;

        if (!items) return null;
        if (!item) return (<Error statusCode="404" />);

        return (
            <div>
                <Head />
                <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
                    <Header />
                    <Drawer />
                    <main className="mdl-layout__content">
                        <div className="page-content mdl-page-content--item">
                            <h3>{item.name}</h3>

                            <h4>Rating: {this.reduceItem(item, ratings)}</h4>

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

                            <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp mdl-data-table--strech">
                                <thead>
                                    <tr>
                                        <th className={`${type === 'Title' ? 'mdl-data-table__header--sorted-' + (sort ? 'ascending': 'descending'): ''}`}>
                                            <a href onClick={this.handleSort.bind(this, 'Title')}>Title</a></th>
                                        <th className={`${type === 'Year' ? 'mdl-data-table__header--sorted-' + (sort ? 'ascending': 'descending'): ''}`}>
                                            <a href onClick={this.handleSort.bind(this, 'Year')}>Year</a></th>
                                        <th className={`${type === 'Genre' ? 'mdl-data-table__header--sorted-' + (sort ? 'ascending': 'descending'): ''}`}>
                                            <a href onClick={this.handleSort.bind(this, 'Genre')}>Genre</a></th>
                                        <th>Poster</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.movies && map(item._movies, (movie, idx) => <tr key={idx}>
                                        <td>{movie.Title}</td>
                                        <td>{movie.Year}</td>
                                        <td>{movie.Genre}</td>
                                        <td><img src={movie.Poster} /></td>
                                        <td>
                                            <span>{this.reduceMovie(movie, ratings)}</span>

                                            <br />
                                            <br />

                                            <a className="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" onClick={this.handleUp.bind(this, movie)} >
                                                <i className="material-icons">thumb_up</i>
                                            </a>

                                            <br />
                                            <br />

                                            <a className="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" onClick={this.handleDown.bind(this, movie)} >
                                                <i className="material-icons">thumb_down</i>
                                            </a>
                                        </td>
                                    </tr>)}
                                </tbody>
                            </table>

                            <a href={`/form?id=${item.id}`} className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored mdl-button--update">
                                <i className="material-icons">edit</i>
                            </a>
                        </div>
                        <style jsx>{`
                            .mdl-page-content--item {
                                margin: 10px;
                            }
                            .mdl-data-table--strech {
                                width: 100%;
                            }
                            .mdl-data-table--strech img {
                                height: 160px;
                            }
                            .mdl-button--update {
                                position: absolute;
                                bottom: 10px;
                                right: 10px;
                            }
                        `}</style>
                    </main>
                </div>
            </div>
        )
    }
}
