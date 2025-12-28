import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { htmlContent, framework, componentName } = await req.json();

    if (!htmlContent || !framework || !componentName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let convertedCode = "";

    switch (framework) {
      case "react":
        convertedCode = convertToReact(htmlContent, componentName);
        break;
      case "react-native":
        convertedCode = convertToReactNative(htmlContent, componentName);
        break;
      case "flutter":
        convertedCode = convertToFlutter(htmlContent, componentName);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid framework" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      code: convertedCode,
      framework,
      componentName,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export component" },
      { status: 500 }
    );
  }
}

function convertToReact(htmlContent: string, componentName: string): string {
  // Basic HTML to React/JSX conversion
  const jsxContent = htmlContent
    // Convert class to className
    .replace(/class=/g, "className=")
    // Convert style strings to objects (basic conversion)
    .replace(/style="([^"]*)"/g, (match, styles) => {
      const styleObj = styles
        .split(";")
        .filter((s: string) => s.trim())
        .map((s: string) => {
          const [key, value] = s.split(":").map((p: string) => p.trim());
          const camelKey = key.replace(/-([a-z])/g, (g: string) =>
            g[1].toUpperCase()
          );
          return `${camelKey}: "${value}"`;
        })
        .join(", ");
      return `style={{${styleObj}}}`;
    });

  return `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    ${jsxContent}
  );
};

export default ${componentName};
`;
}

function convertToReactNative(
  htmlContent: string,
  componentName: string
): string {
  // Basic HTML to React Native conversion
  const rnContent = htmlContent
    // Convert div to View
    .replace(/<div/g, "<View")
    .replace(/<\/div>/g, "</View>")
    // Convert button to TouchableOpacity
    .replace(/<button/g, "<TouchableOpacity")
    .replace(/<\/button>/g, "</TouchableOpacity>")
    // Convert p, span, h1-h6 to Text
    .replace(/<(p|span|h[1-6])/g, "<Text")
    .replace(/<\/(p|span|h[1-6])>/g, "</Text>")
    // Convert img to Image
    .replace(/<img/g, "<Image")
    // Remove class attributes
    .replace(/className="[^"]*"/g, "")
    .replace(/class="[^"]*"/g, "");

  return `import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    ${rnContent}
  );
};

const styles = StyleSheet.create({
  // Add your styles here
});

export default ${componentName};
`;
}

function convertToFlutter(htmlContent: string, componentName: string): string {
  // Basic HTML to Flutter conversion
  const widgetName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  return `import 'package:flutter/material.dart';

class ${widgetName} extends StatelessWidget {
  const ${widgetName}({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // TODO: Convert HTML structure to Flutter widgets
          Text(
            'Component: ${componentName}',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 16),
          // Add your widgets here
        ],
      ),
    );
  }
}
`;
}
