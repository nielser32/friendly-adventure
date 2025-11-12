import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  category: string;
  description: string;
  size: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  strength: number;
}

const HyperbolicSitemap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [centerNode, setCenterNode] = useState<string>('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const centerNodeRef = useRef(centerNode);
  const zoomLevelRef = useRef(zoomLevel);

  useEffect(() => {
    centerNodeRef.current = centerNode;
  }, [centerNode]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const graphData = useMemo(() => {
    const nodes: Node[] = [
      { id: 'home', label: 'Home', category: 'main', description: 'Welcome to our platform', size: 35 },
      { id: 'products', label: 'Products', category: 'main', description: 'Explore our product catalog', size: 28 },
      { id: 'services', label: 'Services', category: 'main', description: 'Professional services we offer', size: 28 },
      { id: 'about', label: 'About Us', category: 'info', description: 'Learn about our company', size: 22 },
      { id: 'blog', label: 'Blog', category: 'content', description: 'Latest insights and articles', size: 24 },
      { id: 'contact', label: 'Contact', category: 'info', description: 'Get in touch with us', size: 22 },
      { id: 'pricing', label: 'Pricing', category: 'business', description: 'View our pricing plans', size: 25 },
      { id: 'docs', label: 'Documentation', category: 'content', description: 'Technical documentation', size: 20 },
      { id: 'api', label: 'API', category: 'tech', description: 'Developer API reference', size: 20 },
      { id: 'support', label: 'Support', category: 'info', description: '24/7 customer support', size: 20 },
      { id: 'careers', label: 'Careers', category: 'info', description: 'Join our team', size: 18 },
      { id: 'partners', label: 'Partners', category: 'business', description: 'Our trusted partners', size: 18 },
      { id: 'case-studies', label: 'Case Studies', category: 'content', description: 'Success stories', size: 18 },
      { id: 'resources', label: 'Resources', category: 'content', description: 'Helpful resources', size: 18 },
      { id: 'community', label: 'Community', category: 'social', description: 'Join our community', size: 20 },
      { id: 'events', label: 'Events', category: 'social', description: 'Upcoming events', size: 17 },
      { id: 'newsletter', label: 'Newsletter', category: 'social', description: 'Subscribe to updates', size: 16 },
      { id: 'security', label: 'Security', category: 'tech', description: 'Security information', size: 18 },
      { id: 'privacy', label: 'Privacy', category: 'legal', description: 'Privacy policy', size: 15 },
      { id: 'terms', label: 'Terms', category: 'legal', description: 'Terms of service', size: 15 },
    ];

    const links: Link[] = [
      { source: 'home', target: 'products', strength: 1.0 },
      { source: 'home', target: 'services', strength: 1.0 },
      { source: 'home', target: 'about', strength: 0.8 },
      { source: 'home', target: 'blog', strength: 0.7 },
      { source: 'home', target: 'contact', strength: 0.8 },
      { source: 'products', target: 'pricing', strength: 0.9 },
      { source: 'products', target: 'docs', strength: 0.7 },
      { source: 'services', target: 'pricing', strength: 0.9 },
      { source: 'services', target: 'case-studies', strength: 0.8 },
      { source: 'docs', target: 'api', strength: 0.9 },
      { source: 'about', target: 'careers', strength: 0.7 },
      { source: 'about', target: 'partners', strength: 0.6 },
      { source: 'blog', target: 'resources', strength: 0.7 },
      { source: 'blog', target: 'newsletter', strength: 0.6 },
      { source: 'contact', target: 'support', strength: 0.8 },
      { source: 'community', target: 'events', strength: 0.8 },
      { source: 'community', target: 'blog', strength: 0.6 },
      { source: 'resources', target: 'case-studies', strength: 0.7 },
      { source: 'api', target: 'security', strength: 0.7 },
      { source: 'security', target: 'privacy', strength: 0.6 },
      { source: 'privacy', target: 'terms', strength: 0.8 },
    ];

    return { nodes, links };
  }, []);

  const categoryColors = {
    main: '#a7c080',
    info: '#7fbbb3',
    content: '#dbbc7f',
    business: '#d699b6',
    tech: '#e67e80',
    social: '#83c092',
    legal: '#9da9a0',
  };

  const hyperbolicTransform = (x: number, y: number, centerX: number, centerY: number) => {
    const currentZoom = zoomLevelRef.current;
    const dx = x - centerX;
    const dy = y - centerY;
    const d = Math.sqrt(dx * dx + dy * dy);
    const maxD = Math.min(dimensions.width, dimensions.height) / 2;

    if (d === 0) return { x: centerX, y: centerY, scale: 2.2 * currentZoom };

    const r = Math.tanh(d / maxD * 2.5 / currentZoom) * maxD * 0.95;
    const scale = Math.max(0.2, (2.2 - (d / maxD) * 2) * currentZoom);
    
    return {
      x: centerX + (dx / d) * r,
      y: centerY + (dy / d) * r,
      scale
    };
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const defs = svg.append('defs');
    
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    const filteredGraphData = activeCategory 
      ? {
          nodes: graphData.nodes.filter(n => n.category === activeCategory),
          links: graphData.links.filter((l: any) => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return graphData.nodes.find(n => n.id === sourceId && n.category === activeCategory) &&
                   graphData.nodes.find(n => n.id === targetId && n.category === activeCategory);
          })
        }
      : graphData;

    const simulation = d3.forceSimulation(filteredGraphData.nodes)
      .force('link', d3.forceLink(filteredGraphData.links)
        .id((d: any) => d.id)
        .distance(100)
        .strength((d: any) => d.strength))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 15));

    const link = g.append('g')
      .selectAll('line')
      .data(filteredGraphData.links)
      .enter().append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d: any) => d.strength * 2.5);

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(filteredGraphData.nodes)
      .enter().append('g')
      .style('cursor', 'pointer');

    const node = nodeGroup.append('circle')
      .attr('r', (d: Node) => d.size)
      .attr('fill', (d: Node) => categoryColors[d.category as keyof typeof categoryColors])
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .style('transition', 'all 0.3s ease');

    const label = nodeGroup.append('text')
      .text((d: Node) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.5)');

    nodeGroup
      .on('mouseenter', function(event, d: any) {
        setHoveredNode(d);
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size * 1.3)
          .attr('stroke-width', 4);
      })
      .on('mouseleave', function(event, d: any) {
        setHoveredNode(null);
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size)
          .attr('stroke-width', 3);
      })
      .on('click', function(event, d: any) {
        event.stopPropagation();
        setSelectedNode(d);
        setCenterNode(d.id);
        
        const targetX = centerX;
        const targetY = centerY;
        
        d.fx = targetX;
        d.fy = targetY;
        
        simulation.alpha(0.5).restart();
        
        setTimeout(() => {
          d.fx = null;
          d.fy = null;
        }, 1200);
      });

    const drag = d3.drag<SVGGElement, Node>()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag as any);

    simulation.on('tick', () => {
      const currentCenterId = centerNodeRef.current;
      const center = filteredGraphData.nodes.find(n => n.id === currentCenterId);
      const focusX = center?.x || centerX;
      const focusY = center?.y || centerY;

      link
        .attr('x1', (d: any) => {
          const transformed = hyperbolicTransform(d.source.x, d.source.y, focusX, focusY);
          return transformed.x;
        })
        .attr('y1', (d: any) => {
          const transformed = hyperbolicTransform(d.source.x, d.source.y, focusX, focusY);
          return transformed.y;
        })
        .attr('x2', (d: any) => {
          const transformed = hyperbolicTransform(d.target.x, d.target.y, focusX, focusY);
          return transformed.x;
        })
        .attr('y2', (d: any) => {
          const transformed = hyperbolicTransform(d.target.x, d.target.y, focusX, focusY);
          return transformed.y;
        })
        .attr('opacity', (d: any) => {
          const sourceT = hyperbolicTransform(d.source.x, d.source.y, focusX, focusY);
          const targetT = hyperbolicTransform(d.target.x, d.target.y, focusX, focusY);
          return Math.min(sourceT.scale, targetT.scale) * 0.5;
        });

      nodeGroup.attr('transform', (d: Node) => {
        const transformed = hyperbolicTransform(d.x || 0, d.y || 0, focusX, focusY);
        return `translate(${transformed.x},${transformed.y}) scale(${transformed.scale})`;
      });

      node.attr('opacity', (d: Node) => {
        const transformed = hyperbolicTransform(d.x || 0, d.y || 0, focusX, focusY);
        return Math.max(0.4, transformed.scale / 2.2);
      });

      label
        .attr('font-size', (d: Node) => {
          const transformed = hyperbolicTransform(d.x || 0, d.y || 0, focusX, focusY);
          return `${Math.max(6, 13 * transformed.scale / 2.2)}px`;
        })
        .attr('opacity', (d: Node) => {
          const transformed = hyperbolicTransform(d.x || 0, d.y || 0, focusX, focusY);
          return transformed.scale > 0.6 ? 1 : 0;
        });
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions, graphData, activeCategory]);

  const filteredNodes = graphData.nodes.filter(node => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || node.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#1e2326] via-[#272e33] to-[#2e383c] overflow-hidden relative">
      {showWelcome && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-gradient-to-br from-[#272e33] to-[#2e383c] rounded-2xl p-8 max-w-lg mx-4 border border-[#414b50] shadow-2xl">
            <h2 className="text-3xl font-bold text-[#d3c6aa] mb-4">Welcome to Interactive Navigation</h2>
            <div className="space-y-3 text-[#9da9a0] mb-6">
              <p className="flex items-start">
                <span className="text-[#a7c080] mr-3 text-xl">•</span>
                <span><strong className="text-[#d3c6aa]">Click</strong> any node to bring it into focus</span>
              </p>
              <p className="flex items-start">
                <span className="text-[#7fbbb3] mr-3 text-xl">•</span>
                <span><strong className="text-[#d3c6aa]">Drag</strong> nodes to explore connections</span>
              </p>
              <p className="flex items-start">
                <span className="text-[#dbbc7f] mr-3 text-xl">•</span>
                <span><strong className="text-[#d3c6aa]">Hover</strong> to preview page details</span>
              </p>
              <p className="flex items-start">
                <span className="text-[#d699b6] mr-3 text-xl">•</span>
                <span><strong className="text-[#d3c6aa]">Scroll</strong> to zoom in and out</span>
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-[#a7c080] text-[#1e2326] py-3 rounded-lg font-semibold hover:bg-[#b8d0a0] transition-all shadow-lg"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <h1 className="text-4xl font-bold text-[#d3c6aa] mb-2">
                Explore Our Universe
              </h1>
              <p className="text-[#859289]">Navigate through hyperbolic space</p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-[#272e33] bg-opacity-90 backdrop-blur-md text-[#d3c6aa] placeholder-[#859289] rounded-lg border border-[#414b50] focus:outline-none focus:border-[#a7c080] transition-all shadow-lg"
              />
              <button
                onClick={() => {
                  setCenterNode('home');
                  setActiveCategory(null);
                  setSelectedNode(null);
                  setZoomLevel(1);
                }}
                className="px-4 py-2 bg-[#a7c080] text-[#1e2326] rounded-lg hover:bg-[#b8d0a0] transition-all shadow-lg font-medium"
              >
                Reset
              </button>
            </div>
          </div>
          
          {searchTerm && (
            <div className="bg-[#272e33] bg-opacity-90 backdrop-blur-md rounded-xl p-4 mb-4 border border-[#414b50] shadow-xl">
              <h3 className="text-[#d3c6aa] font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Found {filteredNodes.length} results:
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setActiveCategory(node.category || null);
                      setCenterNode(node.id);
                      setSelectedNode(node);
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-[#414b50] text-[#d3c6aa] rounded-full hover:bg-[#4f585e] transition-all text-sm font-medium shadow-md hover:shadow-lg"
                    style={{
                      borderLeft: `3px solid ${categoryColors[node.category as keyof typeof categoryColors]}`
                    }}
                  >
                    {node.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div 
        onWheel={handleWheel}
        className="w-full h-full"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        />
      </div>

      {(hoveredNode || selectedNode) && (
        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
          <div className="max-w-md mx-auto bg-gradient-to-br from-[#272e33] to-[#2e383c] backdrop-blur-xl rounded-2xl p-6 border border-[#414b50] shadow-2xl pointer-events-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded-full mr-3 shadow-lg"
                    style={{
                      backgroundColor: categoryColors[(hoveredNode || selectedNode)?.category as keyof typeof categoryColors]
                    }}
                  />
                  <h3 className="text-2xl font-bold text-[#d3c6aa]">
                    {(hoveredNode || selectedNode)?.label}
                  </h3>
                </div>
                <p className="text-[#9da9a0] mb-4 leading-relaxed">
                  {(hoveredNode || selectedNode)?.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-[#859289] uppercase tracking-wider font-semibold">
                    {(hoveredNode || selectedNode)?.category}
                  </span>
                  <button className="px-4 py-1.5 bg-[#a7c080] hover:bg-[#b8d0a0] text-[#1e2326] text-sm rounded-lg transition-colors font-medium shadow-md">
                    Visit Page →
                  </button>
                </div>
              </div>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#859289] hover:text-[#d3c6aa] transition-colors ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-[#272e33] bg-opacity-90 backdrop-blur-md rounded-xl p-4 border border-[#414b50] shadow-xl mb-4">
          <h4 className="text-[#d3c6aa] font-semibold mb-3 text-sm uppercase tracking-wider">Zoom</h4>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.2))}
              className="p-2 bg-[#414b50] hover:bg-[#4f585e] text-[#d3c6aa] rounded-lg transition-colors"
              title="Zoom out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <span className="text-[#d3c6aa] text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
              className="p-2 bg-[#414b50] hover:bg-[#4f585e] text-[#d3c6aa] rounded-lg transition-colors"
              title="Zoom in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="bg-[#272e33] bg-opacity-90 backdrop-blur-md rounded-xl p-4 border border-[#414b50] shadow-xl">
          <h4 className="text-[#d3c6aa] font-semibold mb-3 text-sm uppercase tracking-wider">Categories</h4>
          <div className="space-y-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <button
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-all ${
                  activeCategory === category 
                    ? 'bg-[#414b50]' 
                    : 'hover:bg-[#323a3e]'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-md"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-[#d3c6aa] capitalize font-medium flex-1 text-left">
                  {category}
                </span>
                <span className="text-xs text-[#859289]">
                  {graphData.nodes.filter(n => n.category === category).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowWelcome(true)}
        className="absolute top-6 right-6 z-10 p-2 bg-[#272e33] bg-opacity-90 backdrop-blur-md rounded-lg border border-[#414b50] text-[#859289] hover:text-[#d3c6aa] hover:bg-[#323a3e] transition-all"
        title="Show help"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};

export default HyperbolicSitemap;