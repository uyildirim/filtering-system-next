import { db } from "@/db";
import { ProductFilterValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

class Filter {
  private filters: Map<string, string[]> = new Map();
  hasFilter() {
    return this.filters.size > 0;
  }
  add(key: string, operator: string, value: string | number) {
    const filter = this.filters.get(key) || [];
    filter.push(
      // color = "white"
      `${key} ${operator} ${typeof value === "number" ? value : `"${value}"`}`
    );
    this.filters.set(key, filter);
  }

  // color -> ["white", "beige"]
  // size -> ["L", "S"]

  // (color = "white" OR "color = beige") AND (size = "L")

  addRaw(key: string, rawFilter: string) {
    this.filters.set(key, [rawFilter]);
  }
  get() {
    const parts: string[] = [];
    this.filters.forEach((filter) => {
      const groupedValues = filter.join(` OR `);
      parts.push(`(${groupedValues})`);
    });
    return parts.join(` AND `);
  }
}

export const POST = async (requset: NextRequest, response: NextResponse) => {
  try {
    const body = await requset.json();

    const { color, price, size, sort } = ProductFilterValidator.parse(
      body.filter
    );

    const filter = new Filter();

    if (color.length > 0)
      color.forEach((color) => filter.add("color", "=", color));
    else if (color.length === 0) filter.addRaw("color", "color = ''");

    if (size.length > 0) size.forEach((size) => filter.add("size", "=", size));
    else if (size.length === 0) filter.addRaw("size", "size=''");

    filter.addRaw("price", `price >= ${price[0]} and price <= ${price[1]}`);

    const products = await db.query({
      topK: 12,
      vector: [0, 0, sort === "none" ? 25 : sort === "price-asc" ? 0 : 50],
      includeMetadata: true,
      filter: filter.hasFilter() ? filter.get() : undefined,
    });
    return new Response(JSON.stringify(products));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error" }));
  }
};
