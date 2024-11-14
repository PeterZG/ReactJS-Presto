# Assessment 4 - ReactJS: Presto

1. Background & Motivation
2. The Task (Frontend)
3. The Support (Backend)
4. Constraints & Assumptions

## 0. Change Log

- 01/04/2023 Fix movable element spec & video element's url option & Fix backend swaggerdoc

## 1. Before you start

### 1.1. Background & Motivation

Simulated Scene - In March of 2024 you and your friends pitched a startup idea to produce *An alternative to [slides.com](https://slides.com) that is a lean, lightweight app that is a lot more enjoyable and interesting to use* and that will *revolutionise the presentations industry for decades to come*. You pitched this solution in the form of a web-based application, and called this quiz application 🪄🪄🪄**Presto**🪄🪄🪄.

A week later you received a tentative $50,000 investment from an [Angel Investor](https://en.wikipedia.org/wiki/Angel_investor) pending you producing a working minimum viable product of the application.

Shortly after you discussed the functionality and feature set with your friends, and wrote out a RESTful specification / interface together so that you can split up the frontend and backend work between the group. You build the frontend, they build the backend. To get things moving, the backend was built EXTREMELY light in order to reduce the amount of interfacing needed.

Whilst you (and optionally another one of your friends) decided to work on building the frontend. You wrote a list of requirements and functionalities your frontend should adhere to (described in `section 2`). You also decided to complete this application in `ReactJS`, a declarative framework for building single page applications. This front-end will interact with a Restful API that your team members are producing, based on the pre-defined interface.

Because your MVP is only going to be demonstrated once, your team considers it imperative that your front-end is thoroughly tested.

To satisfy modern tastes and expectations you have also decided to ensure that the UI/UX and Accessibility standards are very high.

**This project is the process you building the front-end for that MVP(Minimum viable product) to the standards described.** This project is closely modelled off the popular website [slides](https://slides.com/). If you're not familiar with the site, we would recommend spending the time to try it out so that you can get a feel for how this application may function as a reference point.

### 1.2. Materials to watch

Before starting, I need to watch at least the following materials:
- [Javascript Ecosystem](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-ecosystem)
- [Node Package Manager](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-npm)
- [ReactJS Introduction](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-intro)
- [ReactJS Global CSS Usage](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-basic)
- [ReactJS Lifecycle](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-lifecycle)
- [ReactJS useState hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-state)
- [ReactJS useEffect hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-effect)
- [Working with multiple files](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/multi-file-import)
- [Components & Props](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-components-props)
- [Linting](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-linting)

To finish the project completely, I also need to watch:
- [Routing & SPAs](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-routing-spas)
- [CSS Frameworks](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-frameworks)
- [useContext hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-context)
- [Testing introduction](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-intro)
- [Component testing](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-components)
- [UI Testing](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-ui)

## 2. The Front-End (Work to Do)

I am building the frontend for the provided backend. This frontend should be a single-page application that does **NOT** require a refresh for state updates. If the app doesn't function as a fully single-page app, it will result in significant penalties.

The requirements describe a series of **screens**. Screens can be presented as popups/modals, or full-page views. *Screen* refers to a specific state or representation of the web application. I have flexibility in how to implement them, whether as modals, separate pages, or other appropriate UI components.

Anything marked 🙉🙉🙉 only needs to be completed by pair attempts, not individual attempts.

### 2.1. Feature Set 1. Login & Presentation Creation (10%)

This feature set focuses solely on login, registration, and logout. It doesn't concern itself with functionalities beyond logging in.

#### 2.1.1. Login Screen
- A unique route must exist for this screen.
- Users can enter their `email` and `password` in a form.
- A button exists to submit the form.
- If the form submission fails, a reasonable error message should appear.
- The form must submit when the enter key is pressed.

#### 2.1.2. Register Screen
- A unique route must exist for this screen.
- Users can enter their `email`, `password`, and `name` in a form.
- A confirm `password` field should exist to ensure the user re-enters their password.
- If the passwords don't match, an error popup should appear.
- If registration fails, a reasonable error message should appear.
- A button exists to submit the form.
- The form must submit when the enter key is pressed.

#### 2.1.3. Logout Button
- On all screens that require authentication, a logout button exists.
- When clicked, this button returns users to the login screen.

### 2.2. Feature Set 2. Setting up Slides (13%)

#### 2.2.1. New Presentation on Dashboard
- When logged in, users are presented with a dashboard containing a "New presentation" button.
- When clicked, a [modal](https://www.w3schools.com/w3css/w3css_modal.asp) appears where users can name the new presentation.
- The modal should contain a "Create" button that, when clicked, disappears the modal, creates the new presentation, and adds it to the dashboard. A default presentation contains a single empty slide.

#### 2.2.2. List of Presentations on Dashboard
- A unique route exists for the dashboard screen.
- Presentations are displayed as cards (rectangles with a 2:1 width:height ratio).
- Each card includes the presentation name, a thumbnail (grey square if empty), a description, and the number of slides.
- Rectangles should be spaced evenly across rows and columns, with each having a width between `100px` and `300px`.

#### 2.2.3. Presentation Controls
- Clicking a presentation redirects the user to a unique route, parameterized by the presentation ID, to edit the presentation.
- Two controls should always be visible on this edit page:
  - "Back" button that takes users back to the dashboard.
  - "Delete Presentation" button that prompts "Are you sure?" and, if confirmed, deletes the presentation and redirects to the dashboard.

#### 2.2.4. Title Editing
- The presentation title should be visible at all times above the slideshow deck.
- A text/icon/button should allow users to edit the title via a modal.

#### 2.2.5. Creating Slides & Navigating Between Them
- A button should be visible for creating a new slide.
- New slides are added at the end of the deck.
- Navigation arrows (left and right) should allow users to move between slides. Keyboard keys should also work.
- The first slide should have no previous arrow, and the last slide should have no next arrow.

#### 2.2.6. Deleting Slides
- A button to delete the current slide should be visible.
- If the user tries to delete the only slide in the presentation, an error message should prompt them to delete the entire presentation.

#### 2.2.7. Slide Numbers
- The slide number should be visible in the bottom left of the slide.
- The font size should be `1em`, and the number should be inside a `50px` by `50px` box. If there is only one slide, the number should display as "1".


## 2.3. Feature Set 3. Essential Features

### 2.3.1. Putting TEXT on the Slide

On the slideshow edit screen, each slide has an action to add a text box. This action can be visible in a list of tools or hidden under a collapsible panel. When the user clicks on the action:

1. A modal will appear to accept user input for:
   - The size of the text box
   - The text content of the box
   - The font color
   - The font size (in `em` units)
2. The text box should be able to:
   - Be positioned anywhere on the slide, with options for editing its location and size.
   - Allow users to adjust the size of the text box by dragging any of its corners.

### 2.3.2. Putting an IMAGE on the Slide

For adding images, each slide in the slideshow edit screen should have an action clearly described as adding an image. Clicking this action triggers a modal that asks for:

1. The size of the image area
2. Either a URL or a base64-encoded string for the image
3. A description of the image for the `alt` tag

### 2.3.3. Putting a VIDEO on the Slide

To add a video, each slide in the slideshow edit screen should provide an action for adding a video. When clicked, it opens a modal with inputs for:

1. The size of the video area
2. The URL of the YouTube video to display
3. Whether or not the video should autoplay

### 2.3.4. Putting CODE on the Slide

For code blocks, each slide in the slideshow should allow adding a code block via a `textarea`. The modal should accept inputs for:

1. The size of the `textarea`
2. The code in the `textarea`
3. The font size in `em` units

Code entered should:
- Preserve whitespace when displayed
- Be syntax-highlighted based on the programming language, which could be C, Python, or JavaScript.

### 2.3.5. Making Elements Movable

For all content blocks (text, image, video, and code), clicking once on a block will show small boxes at each corner of the block (5px x 5px). When the user clicks and drags these boxes, they can move the block around the slide while maintaining its aspect ratio. The block cannot extend beyond the slide edges.

### 2.3.6. Making Elements Resizable

Similarly, clicking once on a block will show 5px x 5px boxes at the corners. Users can drag these to resize the block while maintaining the aspect ratio. The block cannot be resized to smaller than 1% of its width or height, nor can it extend beyond the slide edges.

## 2.4. Feature Set 4. Further Features

### 2.4.1. Font Adjustment

Each text box on the slide should allow users to change its `font-family` on the slideshow edit screen.

### 2.4.2. Theme and Background Picker

A button on each slide should open a modal where users can choose a background for the current slide, either solid or gradient. The modal should also allow users to set a default background for all slides in the slideshow.

### 2.4.3. Preview Viewing

The slideshow should have a preview button that opens another window where the full slideshow is displayed. Arrows should navigate between slides, and the blocks should be shown without borders.

### 2.4.4. URL Updating

When editing a slideshow or previewing it, the slide number should be reflected in the URL. Refreshing the page or sharing the URL should open the exact slide the user was viewing.

### 2.4.5. Slide Transitioning

There should be an animation for transitioning between slides. Options could include swipe left/right or fade transitions.

### 2.4.6. Slide Re-arranging

Users should be able to rearrange slides by clicking and dragging them. The slides will be displayed as numbered rectangles, and users can drop them in a new position.

### 2.4.7. Revision History

A button should open a version history screen where users can restore previous versions of the slideshow. Each modification should be saved automatically at least once every minute.

## 2.6. Linting

Linting is run from the `frontend` folder using the `npm run lint` command. If needed, linting can be disabled during hot reload by setting `ESLINT_NO_DEV_ERRORS='true'; react-scripts start`.

## 2.7. Testing

### Component Testing

For component testing, I will write tests for 3 components (if solo) or 6 components (if working with a pair). Tests will cover all use cases and edge cases, ensuring clarity and good design. I will use shallow component rendering.

### UI Testing

I will write tests for the "happy path" for an admin, ensuring proper registration, presentation creation, slide management, and login/logout functionality.

## 2.8. Other Notes

- The backend for this application is provided and cannot be modified.
- I will use ReactJS for frontend development, avoiding direct DOM manipulation unless necessary.
- Testing will be done using Cypress and Jest.


## 3.1. The Frontend

1. **Installing Dependencies and Starting the ReactJS Application**:
   - In the `frontend` folder, I will run `npm install` to install all necessary dependencies.
   - Then, I will run `npm start` to start the ReactJS application and ensure it displays correctly in my browser.

2. **Functionality Description**:
   - **Frontend Focus**: I do not need to make any changes to the backend. My main task is to ensure that the frontend interacts with the backend via the API.
   - **Question Component**: I am required to define the `questions` component, which will interact with the backend. The backend will return an empty object for this component, but it's my responsibility to implement it on the frontend.

3. **Accessing the Backend API**:
   - After I start the backend server, it will be available at `http://localhost:5005`. I can visit this URL to see the available HTTP routes.

4. **Frontend-Backend Interaction**:
   - The frontend is configured to interact with the backend via a specified port. I will find and modify this configuration in `frontend/src/config.js`. I need to ensure that the frontend can access the backend API through the correct port.

5. **Suggested Reading**:
   - I can refer to [ReactJS Resources](https://cgi.cse.unsw.edu.au/~cs6080/NOW/help/resources/reactjs) for better understanding of how to implement the frontend functionality.

## 3.2. The backend

1. **Backend Server**:
   - The backend is already provided, and I am not allowed to modify it. My task is to ensure the frontend interacts correctly with the backend.
   - I will go to the `backend` folder and run `npm install` to install the required dependencies.
   - To start the backend server, I will run `npm start`.

2. **Backend Persistence**:
   - The backend automatically stores data, meaning the data will persist even after the Express server is stopped.
   - If I wish to reset the backend data to its initial state, I can use the `npm run reset` command.
   - To back up the data, I can copy the `database.json` file or use `npm run clear` to clear the database.

3. **API Routes**:
   - The backend API routes documentation can be accessed through the browser at `http://localhost:[port]`.
   - The port used by the backend is specified in the frontend configuration file (in `frontend/src/config.js`), and I can modify it if needed.

## 4. Constraints & Assumptions

1. **Use of ReactJS**:
   - I must complete the project using ReactJS. I cannot use other declarative frameworks (e.g., Angular or Vue).
   - I should use ReactJS solutions wherever possible and avoid manipulating the DOM directly unless necessary.

2. **UI Libraries and CSS Libraries**:
   - I am allowed to use any CSS or UI library, such as react-bootstrap or material-ui. I must ensure all changes to `package.json` are committed.

3. **Browser Compatibility**:
   - My program should be tested on the following two browsers:
     - Google Chrome (across different operating systems), ensuring I am using the latest version.
     - Testing on CSE machines.

4. **Use of Online Code**:
   - I may use small amounts (<10 lines) of general code from online resources (e.g., Stack Overflow), but I must cite the source. If I use more substantial code, the source must be properly credited and commented.

5. **Other Requirements**:
   - The project specification is intentionally vague so that I can freely design the appearance and behavior of frontend components. The size, position, color, and layout of components are mostly up to me.
   - Other than the restriction on universal CSS, I am free to use any npm libraries available.
   - The use of generic CSS is prohibited. I must use CSS libraries (like material-ui) or [styled-components](https://styled-components.com/docs/basics).
