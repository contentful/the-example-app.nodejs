describe('The Example App', () => {
  context('basics', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('meta tags', () => {
      cy.title().should('equals', 'Home — The Example App', 'Home page should have correct meta title')
      cy.get('meta[name="description"]').should('attr', 'content', 'This is The Example App, an application built to serve you as a reference while building your own applications using Contentful.')

      cy.get('meta[name="twitter:card"]').should('attr', 'content', 'This is The Example App, an application built to serve you as a reference while building your own applications using Contentful.')

      cy.get('meta[property="og:title"]').should('attr', 'content', 'Home — The Example App')
      cy.get('meta[property="og:type"]').should('attr', 'content', 'article')
      cy.get('meta[property="og:url"]').should('exist')
      cy.get('meta[property="og:image"]').should('exist')
      cy.get('meta[property="og:image:type"]').should('attr', 'content', 'image/jpeg')
      cy.get('meta[property="og:image:width"]').should('attr', 'content', '1200')
      cy.get('meta[property="og:image:height"]').should('attr', 'content', '1200')
      cy.get('meta[property="og:description"]').should('attr', 'content', 'This is The Example App, an application built to serve you as a reference while building your own applications using Contentful.')

      cy.get('link[rel="apple-touch-icon"]')
        .should('attr', 'sizes', '120x120')
        .should('attr', 'href', '/apple-touch-icon.png')
      cy.get('link[rel="icon"]').should('have.length.gte', 2, 'containts at least 2 favicons')
      cy.get('link[rel="manifest"]').should('attr', 'href', '/manifest.json')
      cy.get('link[rel="mask-icon"]')
        .should('attr', 'href', '/safari-pinned-tab.svg')
        .should('attr', 'color', '#4a90e2')
      cy.get('meta[name="theme-color"]').should('attr', 'content', '#ffffff')
    })

    it('global elements', () => {
      cy.get('.header__upper')
        .should('contain', 'Help')
        .should('contain', 'GitHub')

      cy.get('.main__footer .footer__lower')
        .should('contain', 'Powered by Contentful')
        .should('contain', 'GitHub')
        .should('contain', 'Imprint')
        .should('contain', 'Contact us')
    })

    it('about modal', () => {
      cy.get('section.modal .modal__wrapper').should('hidden')
      cy.get('.header__upper-title a').click()
      cy.get('section.modal .modal__wrapper').should('visible')
      cy.get('section.modal .modal__title').should('contain', 'A referenceable example for developers using Contentful')
      cy.get('section.modal .modal__content').should('contain', 'This is The Example App, an application built to serve you as a reference while building your own applications using Contentful.')

      // Close on background
      cy.get('section.modal .modal__overlay').click({force: true})
      cy.get('section.modal .modal__wrapper').should('hidden')
      cy.get('.header__upper-title a').click()
      cy.get('section.modal .modal__wrapper').should('visible')

      // Close on X
      cy.get('section.modal .modal__close-button').click()
      cy.get('section.modal .modal__wrapper').should('hidden')
      cy.get('.header__upper-title a').click()
      cy.get('section.modal .modal__wrapper').should('visible')

      // Close on "Got this" button
      cy.get('section.modal .modal__cta').click()
      cy.get('section.modal .modal__wrapper').should('hidden')
    })

    it('header dropdowns show and hide', () => {
      cy.get('.header__controls > *:first-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 0)
      cy.get('.header__controls > *:first-child .header__controls_label').click()
      cy.get('.header__controls > *:first-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 1)
      // Should hide dropdown after a while
      cy.wait(300)
      cy.get('.header__controls > *:first-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 0)

      cy.get('.header__controls > *:last-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 0)
      cy.get('.header__controls > *:last-child .header__controls_label').click()
      cy.get('.header__controls > *:last-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 1)
      // Should hide dropdown after a while
      cy.wait(300)
      cy.get('.header__controls > *:last-child .header__controls_dropdown').should('have.css', 'opacity').and('be', 0)
    })

    it('header dropdowns change app context', () => {
      cy.get('.header__controls > *:first-child .header__controls_label').click()
      cy.get('.header__controls > *:first-child .header__controls_dropdown button:last-child').click()
      cy.location('search').should('contain', 'api=cpa')

      cy.get('.header__controls > *:last-child .header__controls_label').click()
      cy.get('.header__controls > *:last-child .header__controls_dropdown button:last-child').click()
      cy.location('search')
        .should('contain', 'locale=de')
        .should('contain', 'api=cpa')
    })
  })

  context('Home', () => {
    it('renders home page', () => {
      cy.visit('/')
      cy.get('main .module-higlighted-course').should('have.length.gte', 1, 'should have at least one highlighted course')
    })
  })

  context('Courses', () => {
    afterEach(() => {
      cy.title().should('match', / — The Example App$/, 'Title has contextual suffix (appname)')
    })

    it('renders course overview', () => {
      cy.visit('/courses')
      cy.get('.course-card').should('have.length.gte', 3, 'renders at least 3 courses')
      cy.get('.layout-sidebar__sidebar-header > h2').should('contain', 'Categories', 'Shows category title in sidebar')
      cy.get('.sidebar-menu__list > .sidebar-menu__item:first-child').should('contain', 'All courses', 'Shows all courses link')
      cy.get('.sidebar-menu__list > .sidebar-menu__item').should('have.length.gte', 2, 'renders at least one category selector')
      cy.get('.sidebar-menu__list > .sidebar-menu__item:first-child > a').should('have.class', 'active', 'All courses is selected by default')
    })

    it('can filter course overview', () => {
      cy.visit('/courses')

      cy.get('.sidebar-menu__list > .sidebar-menu__item:nth-child(2) > a').click()
      cy.get('.sidebar-menu__list > .sidebar-menu__item:nth-child(1) > a').should('not.have.class', 'active', 'All courses link is no more active')
      cy.get('.sidebar-menu__list > .sidebar-menu__item:nth-child(2) > a').should('have.class', 'active', 'First category filter link should be active')
      cy.get('main h1').invoke('text').then((text) => console.log('headline content:', text))

      cy.get('.sidebar-menu__list > .sidebar-menu__item:nth-child(2) > a').invoke('text').then((firstCategoryTitle) => {
        cy.get('main h1').invoke('text').then((headline) => {
          expect(headline).to.match(new RegExp(`^${firstCategoryTitle} \\([0-9]+\\)$`), 'Title now contains the category name with number of courses')
        })
      })
      cy.get('.course-card').should('have.length.gte', 1, 'filtered courses contain at least one course')
    })

    it('tracks the watched state of lessons', () => {
      // Home
      cy.visit('/')

      // Navigate to courses
      cy.get('header.header .main-navigation ul > li:last-child a').click()

      // Click title of course card to open it
      cy.get('.course-card .course-card__title a').first().click()

      // Check that overview link is visited and active
      cy.get('.table-of-contents .table-of-contents__list .table-of-contents__item:nth-child(1) a')
        .should('have.class', 'active')
        .should('have.class', 'visited')
      // Check that lesson link is neither visited nor active
      cy.get('.table-of-contents .table-of-contents__list .table-of-contents__item:nth-child(2) a')
        .should('not.have.class', 'active')
        .should('not.have.class', 'visited')

      // Start first lesson
      cy.get('.course__overview a.course__overview-cta').click()
      // Check that overview link is visited but not active
      cy.get('.table-of-contents .table-of-contents__list .table-of-contents__item:nth-child(1) a')
        .should('not.have.class', 'active')
        .should('have.class', 'visited')
      // Check that lesson link is visited and active
      cy.get('.table-of-contents .table-of-contents__list .table-of-contents__item:nth-child(2) a')
        .should('have.class', 'active')
        .should('have.class', 'visited')
    })
  })

  context('Settings', () => {
    beforeEach(() => {
      cy.visit('/settings')
    })

    it('renders setting with default values', () => {
      cy.title().should('equals', 'Settings — The Example App')
      cy.get('main h1').should('have.text', 'Settings')
      cy.get('.status-block')
      .should('have.length', 1)
      .invoke('text').then((text) => {
        expect(text).to.match(/Connected to space “.+”/)
      })
      cy.get('input#input-space-id').should('have.value', Cypress.env('CONTENTFUL_SPACE_ID'))
      cy.get('input#input-delivery-token').should('have.value', Cypress.env('CONTENTFUL_DELIVERY_TOKEN'))
      cy.get('input#input-preview-token').should('have.value', Cypress.env('CONTENTFUL_PREVIEW_TOKEN'))
    })

    it('checks for required fields', () => {
      cy.get('input#input-space-id').clear()
      cy.get('input#input-delivery-token').clear()
      cy.get('input#input-preview-token').clear()
      cy.get('input[type=submit]').click()

      cy.get('.status-block--info').should('not.exist')
      cy.get('.status-block--success').should('not.exist')
      cy.get('.status-block--error').should('exist')

      cy.get('input#input-space-id').parent().children('.form-item__error-wrapper')
        .should('exist')
        .find('.form-item__error-message')
        .should('have.text', 'This field is required')
      cy.get('input#input-delivery-token').parent().children('.form-item__error-wrapper')
        .should('exist')
        .find('.form-item__error-message')
        .should('have.text', 'This field is required')
      cy.get('input#input-preview-token').parent().children('.form-item__error-wrapper')
        .should('exist')
        .find('.form-item__error-message')
        .should('have.text', 'This field is required')
    })

    it('validates field with actual client', () => {
      cy.get('input#input-space-id').clear().type(Math.random().toString(36).substring(12))
      cy.get('input#input-delivery-token').clear().type(Math.random().toString(36))
      cy.get('input#input-preview-token').clear().type(Math.random().toString(36))
      cy.get('input[type=submit]').click()

      cy.get('.status-block--info').should('not.exist')
      cy.get('.status-block--success').should('not.exist')
      cy.get('.status-block--error').should('exist')

      cy.get('input#input-delivery-token').parent().children('.form-item__error-wrapper')
        .should('exist')
        .find('.form-item__error-message')
        .should('have.text', 'Your Delivery API key is invalid.')
    })

    it('shows success message when valid credentials are supplied', () => {
      cy.get('input#input-space-id').clear().type(Cypress.env('CONTENTFUL_SPACE_ID'))
      cy.get('input#input-delivery-token').clear().type(Cypress.env('CONTENTFUL_DELIVERY_TOKEN'))
      cy.get('input#input-preview-token').clear().type(Cypress.env('CONTENTFUL_PREVIEW_TOKEN'))
      cy.get('input[type=submit]').click()

      cy.get('.status-block--info').should('exist')
      cy.get('.status-block--success').should('exist')
      cy.get('.status-block--error').should('not.exist')

      cy.get('.form-item__error-wrapper').should('not.exist')
    })

    it('enables editorial features and displays them on home', () => {
      cy.get('input#input-editorial-features').check()
      cy.get('input[type=submit]').click()

      cy.get('.status-block--info').should('exist')
      cy.get('.status-block--success').should('exist')
      cy.get('.status-block--error').should('not.exist')

      cy.get('input#input-editorial-features').should('checked')

      cy.visit('/')

      cy.get('.editorial-features').should('exist')
    })
  })
})
