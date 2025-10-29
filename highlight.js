let currentHighlightedId = null; // 定义一个新变量用来保存单一模式下高亮的国家

export function highlightSingleCountry(map, feature) {
    const iso = feature.properties.iso_3166_1_alpha_3;
    const layerId = 'highlight-' + iso;
    console.log('点击了国家:', iso);

    //先判断有没有已经高亮的国家,有的话就清除？
    if (currentHighlightedId) {
        if (map.getLayer(currentHighlightedId)) map.removeLayer(currentHighlightedId);
        if (map.getSource(currentHighlightedId)) map.removeSource(currentHighlightedId);
    }

    // 添加当前图层
    map.addSource(layerId, {
        type: 'geojson',
        data: feature.toJSON ? feature.toJSON() : feature
    });

    map.addLayer({
        id: layerId,
        type: 'line',
        source: layerId,
        paint: {
            'line-color': '#FFC107', // 颜色后面可以搭配每个SDG的对应颜色
            'line-width': 2
        }
    });

    // 更新当前高亮 ID
    currentHighlightedId = layerId;
   
}