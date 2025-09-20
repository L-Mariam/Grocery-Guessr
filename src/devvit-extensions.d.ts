// // src/devvit-extensions.d.ts
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       text: any;
//       hstack: any;
//       vstack: any;
//       button: any;
//       spacer: any;
//       image: any;
//       textInput: {
//         placeholder?: string;
//         value?: string;
//         onTextChange?: (text: string) => void;
//         disabled?: boolean;
//         inputType?: 'text' | 'number';
//       };
//     }
//   }
// }



// src/devvit-extensions.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: {
        size?: 'small' | 'medium' | 'large';
        weight?: 'regular' | 'bold';
        color?: 'primary' | 'secondary' | 'tertiary';
        alignment?: 'start' | 'center' | 'end';
        children?: any;
      };
      hstack: {
        alignment?: 'start' | 'center' | 'end';
        padding?: 'small' | 'medium' | 'large';
        backgroundColor?: string;
        cornerRadius?: 'small' | 'medium' | 'large';
        children?: any;
      };
      vstack: {
        alignment?: 'start' | 'center' | 'end';
        padding?: 'small' | 'medium' | 'large';
        backgroundColor?: string;
        cornerRadius?: 'small' | 'medium' | 'large';
        children?: any;
      };
      button: {
        onPress?: () => void;
        appearance?: 'primary' | 'secondary' | 'destructive';
        disabled?: boolean;
        children?: any;
      };
      spacer: {
        size?: 'small' | 'medium' | 'large';
        grow?: boolean;
      };
      image: {
        url: string;
        description: string;
        height?: number;
        width?: number;
        resizeMode?: 'fit' | 'fill' | 'cover';
      };
      textinput: {
        placeholder?: string;
        value?: string;
        onTextChange?: (text: string) => void;
        disabled?: boolean;
        inputType?: 'text' | 'number';
      };
    }
  }
}
// 
export {};
