const mockCourse = {
  sys: { id: 'courseId' },
  fields: {
    slug: 'courseSlug',
    title: 'Course title',
    lessons: [
      { sys: {id: 'lessonId'}, fields: { slug: 'lessonSlug', title: 'Lesson title' } }
    ]
  }
}

const mockCategory = {
  sys: {
    id: 'categoryId'
  },
  fields: {
    slug: 'categorySlug',
    title: 'categoryTitle'
  }
}

module.exports = {
  mockCourse,
  mockCategory
}
