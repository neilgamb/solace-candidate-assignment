### Timeline of Effort

- Review instructions (~5 mins)
- Initialize app locally, resolve bugs and restore basic functionality (~10 mins)
- Basic enhancements (~15 mins)
  - Add typescript support
  - Improve filtering / search performance
  - Optimize React list item render
- Review application code and brainstorm ideas for enhancement (~20 mins)
  - Based on the instructions’ emphasis on design and the two-hour time restriction, I decided to scope my efforts almost exclusively to UI and UX enhancements
  - This included coming up with a simple but effective design for the two main elements — the search input and the filtered table
- Implement frontend enhancements (~45 mins)
- Explore backend enhancements (~10 mins)
  - I was left with a little bit of time and had some ideas on some additional frontend/backend enhancements that would be necessary with larger “advocate” datasets, so I spent some time configuring the database to evaluate feasibility of additional implementations
  - Given remaining time, I decided to pull back and instead document these ideas for future enhancements — see below
- Documentation, Discussion and Github (~15 mins)

### Next Steps

- Add server-side search
  - Currently the app handles all the search logic via an array filter on the frontend
  - The amount of memory that this will eat up will sky rocket fairly quickly as the number of advocates in that array increases resulting in extremely problematic performance issues
  - You could offload this to the backend which is much better equipped to handle complex search logic in a more performant way (db indexing, etc)
  - I would probably try to implement a “type ahead” approach as well to provide the “live search” effect. This approach typically involves debouncing the request so prevent unnecessary requests on every keystroke
- Add pagination
  - Would require enhancing the GET endpoint and adding some sort of UI mechanism for advancing the page and triggering subsequent requests. This typically is done via a “infinite scroll” or a more manual button-based UI
  - I would want to ensure that responses are cached properly so that the existing request responses are not lost as you advance pages
- Add A11y to frontend
- Add some tests to demonstrate my understanding of unit + cypress tests
