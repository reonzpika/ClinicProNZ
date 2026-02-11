'use client';

import './xyflow-styles.css';

import type {
  Edge,
  Node,
} from '@xyflow/react';
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useMemo } from 'react';

// Custom node types (extends Record so Node<DecisionNodeData> satisfies React Flow's constraint)
type DecisionNodeData = {
  label: string;
  zone?: 'red' | 'amber' | 'green';
  action?: 'openChecker';
  description?: string;
} & Record<string, unknown>;

// Custom Decision Node Component
function DecisionNode({ data }: { data: DecisionNodeData }) {
  const zoneStyles = {
    red: 'bg-red-50 border-red-500 text-red-900',
    amber: 'bg-amber-50 border-amber-500 text-amber-900',
    green: 'bg-green-50 border-green-500 text-green-900',
  };

  const baseStyle = data.zone
    ? zoneStyles[data.zone]
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div
      className={`rounded-lg border-2 px-6 py-4 ${baseStyle} min-w-[200px] max-w-[300px] shadow-md transition-shadow hover:shadow-lg`}
    >
      <Handle type="target" position={Position.Top} className="size-3" />
      <div className="mb-1 text-center font-semibold">{data.label}</div>
      {data.description && (
        <div className="mt-2 text-center text-xs opacity-80">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="size-3" />
    </div>
  );
}

// Props interface
type InteractiveFlowchartProps = {
  onOpenChecker?: (section?: 'green' | 'amber' | 'red') => void;
};

export function InteractiveFlowchart({ onOpenChecker }: InteractiveFlowchartProps) {
  // Node definitions
  const initialNodes: Node<DecisionNodeData>[] = useMemo(
    () => [
      {
        id: '1',
        type: 'decision',
        position: { x: 250, y: 0 },
        data: {
          label: 'Is the patient on any controlled drugs?',
          description:
            'Opioids, benzodiazepines, tramadol, methylphenidate, cannabis preparations',
        },
      },
      {
        id: '2',
        type: 'decision',
        position: { x: 50, y: 150 },
        data: {
          label: '🔴 STOP',
          zone: 'red',
          description: 'Max 1-3 months (legal limit)',
        },
      },
      {
        id: '3',
        type: 'decision',
        position: { x: 450, y: 150 },
        data: {
          label: 'Check Medication Zone',
          description: 'Click to open checker →',
          action: 'openChecker',
        },
      },
      {
        id: '4',
        type: 'decision',
        position: { x: 50, y: 300 },
        data: {
          label: '🔴 RED Zone',
          zone: 'red',
          description: 'Not suitable - Max 3 months',
        },
      },
      {
        id: '5',
        type: 'decision',
        position: { x: 350, y: 300 },
        data: {
          label: '🟡 AMBER Zone',
          zone: 'amber',
          description: 'Check criteria in table',
        },
      },
      {
        id: '6',
        type: 'decision',
        position: { x: 650, y: 300 },
        data: {
          label: '🟢 GREEN Zone',
          zone: 'green',
          description: 'Generally suitable',
        },
      },
      {
        id: '7',
        type: 'decision',
        position: { x: 350, y: 450 },
        data: {
          label: 'Criteria met?',
          description: 'Check eGFR, age, etc.',
        },
      },
      {
        id: '8',
        type: 'decision',
        position: { x: 200, y: 600 },
        data: {
          label: 'Use 3-6 months',
          zone: 'amber',
          description: 'Criteria not met',
        },
      },
      {
        id: '9',
        type: 'decision',
        position: { x: 500, y: 600 },
        data: {
          label: 'Patient stable?',
          description: 'You define timeframe',
        },
      },
      {
        id: '10',
        type: 'decision',
        position: { x: 350, y: 750 },
        data: {
          label: 'Consider 3-6 months',
          zone: 'amber',
          description: 'Unstable or high-risk',
        },
      },
      {
        id: '11',
        type: 'decision',
        position: { x: 650, y: 750 },
        data: {
          label: 'Clinical Judgment',
          description: '3, 6, or 12 months',
        },
      },
      {
        id: '12',
        type: 'decision',
        position: { x: 650, y: 900 },
        data: {
          label: '✓ Issue Prescription',
          zone: 'green',
          description: 'Document rationale + monitoring',
        },
      },
    ],
    [],
  );

  // Edge definitions
  const initialEdges: Edge[] = useMemo(
    () => [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: 'YES',
        animated: true,
        style: { stroke: '#ef4444' },
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        label: 'NO',
        animated: true,
        style: { stroke: '#22c55e' },
      },
      {
        id: 'e3-4',
        source: '3',
        target: '4',
        label: 'RED',
        style: { stroke: '#ef4444' },
      },
      {
        id: 'e3-5',
        source: '3',
        target: '5',
        label: 'AMBER',
        style: { stroke: '#f59e0b' },
      },
      {
        id: 'e3-6',
        source: '3',
        target: '6',
        label: 'GREEN',
        style: { stroke: '#22c55e' },
      },
      { id: 'e5-7', source: '5', target: '7', animated: true },
      { id: 'e6-9', source: '6', target: '9', animated: true },
      {
        id: 'e7-8',
        source: '7',
        target: '8',
        label: 'NO',
        style: { stroke: '#f59e0b' },
      },
      {
        id: 'e7-9',
        source: '7',
        target: '9',
        label: 'YES',
        animated: true,
        style: { stroke: '#22c55e' },
      },
      {
        id: 'e9-10',
        source: '9',
        target: '10',
        label: 'NO',
        style: { stroke: '#f59e0b' },
      },
      {
        id: 'e9-11',
        source: '9',
        target: '11',
        label: 'YES',
        animated: true,
        style: { stroke: '#22c55e' },
      },
      {
        id: 'e11-12',
        source: '11',
        target: '12',
        animated: true,
        style: { stroke: '#22c55e' },
      },
    ],
    [],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Node types
  const nodeTypes = useMemo(
    () => ({
      decision: DecisionNode,
    }),
    [],
  );

  // Click handler
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<DecisionNodeData>) => {
      if (node.data.action === 'openChecker' && onOpenChecker) {
        onOpenChecker();
      }
    },
    [onOpenChecker],
  );

  return (
    <div className="h-[800px] w-full rounded-lg border border-border bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: false,
          style: { strokeWidth: 2 },
        }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls className="rounded-lg border border-border bg-white shadow-md" />
        <MiniMap
          className="rounded-lg border border-border bg-white shadow-md"
          nodeColor={(node) => {
            const data = node.data as DecisionNodeData;
            if (data.zone === 'red') {
 return '#fecaca';
}
            if (data.zone === 'amber') {
 return '#fde68a';
}
            if (data.zone === 'green') {
 return '#bbf7d0';
}
            return '#e5e7eb';
          }}
        />
      </ReactFlow>
    </div>
  );
}
