// Preserve decision-bearing fields while removing verbose historical prose and inactive catalog
// rows that otherwise push local inference far beyond this machine's safe context budget.
export function compactPromptInputs(inputs) {
  const compactTask = (task) => ({
    id: task.id, status: task.status, agent: task.agent, target_url: task.target_url,
    target_query: task.target_query, action: task.action?.slice(0, 350),
    expected_effect: task.expected_effect?.slice(0, 250), check_back_on: task.check_back_on,
    outcome_score: task.outcome_score, outcome_notes: task.outcome_notes?.slice(0, 250),
  });
  const scored = inputs.outcome_history?.recent ?? [];
  const means = {};
  for (const task of scored) {
    if (!task.agent || !Number.isFinite(task.outcome_score)) continue;
    const bucket = means[task.agent] ?? { total: 0, count: 0 };
    bucket.total += task.outcome_score;
    bucket.count += 1;
    means[task.agent] = bucket;
  }
  const meanByAgent = Object.fromEntries(Object.entries(means).map(([agent, value]) =>
    [agent, { mean: Number((value.total / value.count).toFixed(3)), count: value.count }]));
  return {
    ...inputs,
    open_tasks: (inputs.open_tasks ?? []).map(compactTask),
    outcome_history: {
      mean_by_action: meanByAgent,
      recent: scored.slice(-10).map(compactTask),
    },
    competitor_intel: {
      ...inputs.competitor_intel,
      keywords: (inputs.competitor_intel?.keywords ?? []).slice(0, 20).map(({ domain, keyword, volume, position, url, our_position, our_url }) =>
        ({ domain, keyword, volume, position, url, our_position, our_url })),
      winning_commercial_pages: (inputs.competitor_intel?.winning_commercial_pages ?? []).slice(0, 10)
        .map(({ domain, url, page_type, keyword_count, total_keyword_volume, best_position, top_keywords, our_best_position, opportunity_score }) =>
          ({ domain, url, page_type, keyword_count, total_keyword_volume, best_position, top_keywords: top_keywords?.slice(0, 5), our_best_position, opportunity_score })),
      discovered_competitors: (inputs.competitor_intel?.discovered_competitors ?? []).slice(0, 10)
        .map(({ domain, intersections, avg_position, metrics }) => ({
          domain, intersections, avg_position,
          organic_keyword_count: metrics?.organic?.count,
          estimated_organic_traffic: metrics?.organic?.etv,
        })),
    },
    product_economics: {
      ...inputs.product_economics,
      products: (inputs.product_economics?.products ?? [])
        .filter((product) => product.status === "active")
        .map(({ id, url, handle, title, status, price, inventory, collections, seo_title, seo_description }) =>
          ({ id, url, handle, title, status, price, inventory, collections, seo_title, seo_description })),
    },
    unindexed_pages: {
      ...inputs.unindexed_pages,
      pages: (inputs.unindexed_pages?.pages ?? []).slice(0, 60),
    },
  };
}
