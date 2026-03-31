export default function CategoryRail({ categories, activeCategory, onSelect }) {
  return (
    <section className="category-rail">
      <button
        className={!activeCategory ? 'chip chip--active' : 'chip'}
        onClick={() => onSelect('')}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.category_id}
          className={activeCategory === category.slug ? 'chip chip--active' : 'chip'}
          onClick={() => onSelect(category.slug)}
        >
          {category.name}
          <span>{category.product_count}</span>
        </button>
      ))}
    </section>
  );
}

