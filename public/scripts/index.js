document.addEventListener('DOMContentLoaded', () => {
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

