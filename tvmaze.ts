import axios from "axios";
import * as $ from 'jquery';

const TVMAZE_API_URL = "http://api.tvmaze.com";
const MISSING_TV_IMAGE = "https://tinyurl.com/tv-missing";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

interface IShow {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface IShowAPI {
  id: number;
  name: string;
  summary: string;
  image: { medium: string } | null;
}

interface IEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShow[]> {
  const response = await axios.get(
    `${TVMAZE_API_URL}/search/shows/`, { params: { q: term } }
  );

  return response.data.map((result: { show: IShowAPI }): IShow => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_TV_IMAGE,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: IShow[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<IEpisode[]> {
  const response = await axios.get(
    `${TVMAZE_API_URL}/shows/${id}/episodes`
  );
  console.log(response.data);
  return response.data.map((episode: IEpisode): IEpisode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });
}

/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes: IEpisode[]): void {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
        `<li>${episode.name}
              (Season: ${episode.season},
                Episode: ${episode.number})
        </li>`);

    $episodesList.append($episode);
  }

  $episodesArea.show();
}

/** Handles click on episodes button and displays episodes */

async function getEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  console.log("Episode button works");
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
