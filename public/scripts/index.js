document.addEventListener('DOMContentLoaded', () => {
  // Header dropdowns
  const controls = document.querySelectorAll('.header__controls_group')

  controls.forEach((control) => {
    const ref = control.querySelector('.header__controls_label')
    const dropdownRef = control.querySelector('.header__controls_dropdown')

    let popper = null

    hoverintent(control, null, () => {
      if (popper) {
        dropdownRef.classList.remove('header__controls_dropdown--active')
        window.setTimeout(popper.destroy, 500)
      }
    }).options({
      sensitivity: 10,
      interval: 150,
      timeout: 300
    })

    ref.addEventListener('click', (e) => {
      dropdownRef.classList.add('header__controls_dropdown--active')
      popper = new Popper(
        e.target,
        dropdownRef,
        {
            // popper options here
        }
      )
    })
  })
  // const apiRef =
  // const apiDropdownRef = document.querySelector('#control-api .header__controls_dropdown')

  // const apiTooltip =

  // Init highlight.js
  hljs.initHighlightingOnLoad()

  // apply textFit to module headlines
  textFit(document.getElementsByClassName('module-higlighted-course__title'), {multiLine: false})

  // Lesson code switcher logic
  const modules = Array.from(document.getElementsByClassName('lesson-module-code'))

  modules.forEach((module) => {
    const triggers = Array.from(module.getElementsByClassName('lesson-module-code__trigger'))
    const codes = Array.from(module.getElementsByClassName('lesson-module-code__code'))

    const handleTriggerClick = (e) => {
      const target = e.target.getAttribute('data-target')

      // Mark correct trigger as active
      triggers.forEach((trigger) => {
        trigger.classList.remove('lesson-module-code__trigger--active')
      })
      e.target.classList.add('lesson-module-code__trigger--active')

      // Show correct code fields
      codes.forEach((code) => {
        code.classList.remove('lesson-module-code__code--active')
        if (code.id === target) {
          code.classList.add('lesson-module-code__code--active')
        }
      })
    }

    // Attach click handler to triggers
    triggers.forEach((trigger) => {
      trigger.onclick = handleTriggerClick
    })
  })
})

