export default function CategoryRail({ categories, activeCategory, onSelect }) {
  return (
    <section className="category-rail">
      <button
        className={!activeCategory ? 'chip chip--active' : 'chip'}
        onClick={() => onSelect('')}
      >
        <strong>All</strong>
        <span>Browse everything</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.category_id}
          className={activeCategory === category.slug ? 'chip chip--active' : 'chip'}
          onClick={() => onSelect(category.slug)}
        >
          <strong>{category.name}</strong>
          <span>{category.product_count} items</span>
        </button>
      ))}
    </section>
  );
}
