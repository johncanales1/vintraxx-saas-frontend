"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, DownloadCloud02, Edit01, FilterLines, SearchLg, Settings03, Trash01 } from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { BadgeWithDot, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";

// Helper functions for formatting
const formatCurrency = (value: number): string => {
    return `$${new Intl.NumberFormat("en-US").format(value)}`;
};

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

// Pending Sales data
const pendingSales = [
    {
        id: "ps-01",
        vehicle: { year: 2024, make: "Toyota", model: "Camry", trim: "SE", stockNumber: "ST1042" },
        vin: "1HGBH41JXMN109186",
        buyer: "James Wilson",
        price: 28500,
        status: "pending_finance",
        daysInPipeline: 3,
        date: new Date(2025, 0, 22).getTime(),
    },
    {
        id: "ps-02",
        vehicle: { year: 2023, make: "Honda", model: "Accord", trim: "Sport", stockNumber: "ST1038" },
        vin: "2HGFC2F59PH512345",
        buyer: "Sarah Martinez",
        price: 32200,
        status: "pending_docs",
        daysInPipeline: 5,
        date: new Date(2025, 0, 20).getTime(),
    },
    {
        id: "ps-03",
        vehicle: { year: 2024, make: "Ford", model: "F-150", trim: "XLT", stockNumber: "ST1055" },
        vin: "1FTFW1E87PFA67890",
        buyer: "Michael Brown",
        price: 45800,
        status: "pending_finance",
        daysInPipeline: 2,
        date: new Date(2025, 0, 24).getTime(),
    },
    {
        id: "ps-04",
        vehicle: { year: 2023, make: "Chevrolet", model: "Silverado", trim: "LT", stockNumber: "ST1029" },
        vin: "3GCUYEED3PG234567",
        buyer: "Emily Chen",
        price: 42300,
        status: "pending_trade",
        daysInPipeline: 7,
        date: new Date(2025, 0, 18).getTime(),
    },
    {
        id: "ps-05",
        vehicle: { year: 2024, make: "BMW", model: "3 Series", trim: "330i", stockNumber: "ST1061" },
        vin: "WBA5R1C50PW789012",
        buyer: "David Thompson",
        price: 48900,
        status: "pending_finance",
        daysInPipeline: 1,
        date: new Date(2025, 0, 25).getTime(),
    },
    {
        id: "ps-06",
        vehicle: { year: 2023, make: "Nissan", model: "Altima", trim: "SV", stockNumber: "ST1033" },
        vin: "1N4BL4DV3PN345678",
        buyer: "Lisa Anderson",
        price: 26800,
        status: "pending_docs",
        daysInPipeline: 4,
        date: new Date(2025, 0, 21).getTime(),
    },
    {
        id: "ps-07",
        vehicle: { year: 2024, make: "Mercedes-Benz", model: "C-Class", trim: "C300", stockNumber: "ST1067" },
        vin: "W1KWF8DB2PR456789",
        buyer: "Robert Kim",
        price: 52100,
        status: "pending_finance",
        daysInPipeline: 6,
        date: new Date(2025, 0, 19).getTime(),
    },
    {
        id: "ps-08",
        vehicle: { year: 2023, make: "Audi", model: "A4", trim: "Premium", stockNumber: "ST1045" },
        vin: "WAUDNAF44PN567890",
        buyer: "Jennifer Lee",
        price: 41500,
        status: "pending_trade",
        daysInPipeline: 8,
        date: new Date(2025, 0, 17).getTime(),
    },
    {
        id: "ps-09",
        vehicle: { year: 2024, make: "Toyota", model: "RAV4", trim: "Limited", stockNumber: "ST1072" },
        vin: "2T3P1RFV0PW678901",
        buyer: "William Davis",
        price: 38900,
        status: "pending_finance",
        daysInPipeline: 2,
        date: new Date(2025, 0, 23).getTime(),
    },
    {
        id: "ps-10",
        vehicle: { year: 2023, make: "Honda", model: "CR-V", trim: "EX-L", stockNumber: "ST1036" },
        vin: "7FARW2H93PE789012",
        buyer: "Amanda Taylor",
        price: 35600,
        status: "pending_docs",
        daysInPipeline: 3,
        date: new Date(2025, 0, 22).getTime(),
    },
];

// Vehicle Inventory Aging - radar chart data (single series: vehicle count per aging range)
const radarData = [
    { subject: "0-30 Days", vehicles: 15 },
    { subject: "31-45 Days", vehicles: 8 },
    { subject: "46-60 Days", vehicles: 5 },
    { subject: "61-90 Days", vehicles: 3 },
    { subject: "90+ Days", vehicles: 2 },
];

// Inventory Value - bar chart data (vehicle count per price range)
const barData = [
    { range: "$0-10k", count: 2 },
    { range: "$10-15k", count: 4 },
    { range: "$15-20k", count: 6 },
    { range: "$20-25k", count: 8 },
    { range: "$25-35k", count: 5 },
    { range: "$35-50k", count: 3 },
    { range: "$50-75k", count: 2 },
    { range: "$75k+", count: 1 },
];

export const Dashboard08 = () => {
    const isDesktop = useBreakpoint("lg");

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return pendingSales;

        return pendingSales.toSorted((a, b) => {
            const column = sortDescriptor.column as string;

            let first: string | number = "";
            let second: string | number = "";

            if (column === "vehicle") {
                first = `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`;
                second = `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}`;
            } else if (column === "price" || column === "daysInPipeline") {
                first = a[column];
                second = b[column];
            }

            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [sortDescriptor]);

    return (
        <div className="flex flex-col gap-8">
            <div className="mx-auto flex w-full max-w-container flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                <p className="text-xl font-semibold text-primary lg:text-display-xs">VinLane IMS</p>
                <div className="flex gap-3">
                    <Button size="md" color="tertiary" iconLeading={SearchLg} className="hidden lg:inline-flex" />
                    <Button size="md" color="secondary" iconLeading={FilterLines} className="hidden lg:inline-flex">
                        Filters
                    </Button>
                    <Button size="md" color="secondary" iconLeading={Settings03}>
                        Customize
                    </Button>
                    <Button size="md" color="secondary" iconLeading={DownloadCloud02}>
                        Export
                    </Button>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-container flex-col gap-6 px-4 lg:flex-row lg:px-8">
                {/* Vehicle Inventory Aging - Radar Chart */}
                <div className="flex flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset lg:w-125">
                    <div className="flex flex-col gap-1 px-4 py-5 lg:p-6">
                        <div className="flex items-start justify-between pb-5">
                            <p className="text-md font-semibold text-primary lg:text-lg">Vehicle Inventory Aging</p>
                            <TableRowActionsDropdown />
                        </div>
                        <ResponsiveContainer className="relative min-h-[295.13px] lg:min-h-93">
                            <RadarChart
                                cy="54%"
                                outerRadius="86%"
                                data={radarData}
                                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                className="font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                            >
                                <PolarGrid stroke="currentColor" className="text-utility-gray-100" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    stroke="currentColor"
                                    tick={({ x, y, textAnchor, index, payload, verticalAnchor: _vA, ...props }) => (
                                        <text
                                            x={x}
                                            y={index === 0 ? (y as number) - 14 : index === 3 || index === 4 ? (y as number) + 10 : (y as number)}
                                            textAnchor={textAnchor}
                                            {...props}
                                            className={cx("recharts-text recharts-polar-angle-axis-tick-value", props.className)}
                                        >
                                            <tspan dy="0em" className="fill-utility-gray-700 text-xs font-medium lg:text-sm">
                                                {payload.value}
                                            </tspan>
                                        </text>
                                    )}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <PolarRadiusAxis
                                    textAnchor="middle"
                                    tick={false}
                                    tickCount={5}
                                    axisLine={false}
                                    angle={90}
                                    domain={[0, 20]}
                                />

                                <RechartsTooltip
                                    content={<ChartTooltipContent />}
                                    cursor={{
                                        className: "stroke-utility-brand-600 stroke-2",
                                        style: { transform: "translateZ(0)" },
                                    }}
                                />

                                <Radar
                                    isAnimationActive={false}
                                    className="text-utility-brand-600"
                                    dataKey="vehicles"
                                    name="Vehicles"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                    fill="currentColor"
                                    fillOpacity={0.2}
                                    activeDot={{ className: "fill-bg-primary stroke-utility-brand-600 stroke-2" }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
                        <Button size="md" color="secondary">
                            View full report
                        </Button>
                    </div>
                </div>

                {/* Inventory Value - Bar Chart */}
                <div className="flex flex-1 flex-col gap-1 rounded-xl px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset lg:p-6">
                    <div className="flex items-start justify-between pb-5">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-md font-semibold text-primary lg:text-lg">Inventory Value</p>
                            <p className="text-sm text-tertiary">Vehicle count by price range.</p>
                        </div>
                        <TableRowActionsDropdown />
                    </div>
                    <ResponsiveContainer className="min-h-70.5">
                        <BarChart
                            data={barData}
                            margin={{ left: 4, right: 0, bottom: isDesktop ? 16 : 0 }}
                            className="text-tertiary [&_.recharts-text]:text-xs"
                        >
                            <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                            <XAxis
                                fill="currentColor"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={2}
                                dataKey="range"
                            >
                                {isDesktop && <Label value="Price Range" fill="currentColor" className="!text-xs font-medium" position="bottom" />}
                            </XAxis>

                            <YAxis hide={!isDesktop} fill="currentColor" axisLine={false} tickLine={false} allowDecimals={false}>
                                <Label
                                    value="Vehicles"
                                    fill="currentColor"
                                    className="!text-xs font-medium"
                                    style={{ textAnchor: "middle" }}
                                    angle={-90}
                                    position="insideLeft"
                                />
                            </YAxis>

                            <RechartsTooltip
                                content={<ChartTooltipContent />}
                                cursor={{ className: "fill-utility-gray-200/20" }}
                            />

                            <Bar
                                isAnimationActive={false}
                                className="text-utility-brand-600"
                                dataKey="count"
                                name="Vehicles"
                                fill="currentColor"
                                maxBarSize={isDesktop ? 32 : 16}
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pending Sales Table */}
            <div className="mx-auto flex w-full max-w-container flex-col gap-4 px-4 lg:gap-6 lg:px-8">
                <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-lg font-semibold text-primary">Pending Sales</p>
                        <p className="text-sm text-tertiary">Track vehicles in the sales pipeline.</p>
                    </div>
                    <Input icon={SearchLg} shortcut aria-label="Search" placeholder="Search" size="sm" className="hidden w-80 lg:inline-flex" />
                </div>
                <div className="flex flex-col gap-3 lg:hidden">
                    <Input icon={SearchLg} shortcut aria-label="Search" placeholder="Search" size="sm" />
                    <Button iconLeading={FilterLines} size="md" color="secondary">
                        Filters
                    </Button>
                </div>

                <TableCard.Root className="-mx-4 mt-2 rounded-none lg:mx-0 lg:mt-0 lg:rounded-xl">
                    <Table
                        aria-label="Pending Sales"
                        selectionMode="multiple"
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                    >
                        <Table.Header className="bg-primary">
                            <Table.Head id="vehicle" isRowHeader allowsSorting label="Vehicle" className="w-full" />
                            <Table.Head id="vin" label="VIN" />
                            <Table.Head id="buyer" label="Buyer" />
                            <Table.Head id="price" allowsSorting label="Price" />
                            <Table.Head id="status" label="Status" />
                            <Table.Head id="daysInPipeline" allowsSorting label="Days" />
                            <Table.Head id="actions" />
                        </Table.Header>
                        <Table.Body items={sortedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)}>
                            {(sale) => (
                                <Table.Row id={sale.id}>
                                    <Table.Cell>
                                        <p className="text-sm font-medium text-primary text-nowrap">
                                            {sale.vehicle.year} {sale.vehicle.make} {sale.vehicle.model} #{sale.vehicle.stockNumber}
                                        </p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="font-mono text-xs text-tertiary">{sale.vin}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p className="text-sm text-primary text-nowrap">{sale.buyer}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-sm font-medium text-primary">{formatCurrency(sale.price)}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <BadgeWithDot
                                            size="sm"
                                            type="pill-color"
                                            color={
                                                sale.status === "pending_finance"
                                                    ? "warning"
                                                    : sale.status === "pending_docs"
                                                      ? "blue"
                                                      : "brand"
                                            }
                                        >
                                            {sale.status === "pending_finance"
                                                ? "Pending Finance"
                                                : sale.status === "pending_docs"
                                                  ? "Pending Docs"
                                                  : "Pending Trade"}
                                        </BadgeWithDot>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <BadgeWithIcon
                                            iconLeading={sale.daysInPipeline > 5 ? ArrowUp : ArrowDown}
                                            size="sm"
                                            type="pill-color"
                                            color={sale.daysInPipeline > 5 ? "error" : "success"}
                                        >
                                            {sale.daysInPipeline}d
                                        </BadgeWithIcon>
                                    </Table.Cell>
                                    <Table.Cell className="px-4">
                                        <div className="flex justify-end gap-0.5">
                                            <ButtonUtility size="xs" color="tertiary" tooltip="Delete" icon={Trash01} />
                                            <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                    <PaginationCardMinimal page={page} total={Math.ceil(sortedItems.length / itemsPerPage)} align="center" onPageChange={setPage} />
                </TableCard.Root>
            </div>
        </div>
    );
};
