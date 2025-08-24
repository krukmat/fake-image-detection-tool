# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - heading "Media Manipulation Detection" [level=1] [ref=e4]
    - paragraph [ref=e5]: Compare two images to detect potential manipulation
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: "Original Image URL:"
      - textbox "Original Image URL:" [ref=e9]: https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Test+Image
    - generic [ref=e10]:
      - generic [ref=e11]: "Suspect Image URL:"
      - textbox "Suspect Image URL:" [ref=e12]: https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Test+Image
    - button "Analyze Images" [active] [ref=e13] [cursor=pointer]
  - generic [ref=e14]:
    - heading "Error" [level=2] [ref=e15]
    - generic [ref=e16]: "Failed to download media: HTTPSConnectionPool(host='via.placeholder.com', port=443): Max retries exceeded with url: /400x300/FF0000/FFFFFF.png?text=Test+Image (Caused by NewConnectionError('<urllib3.connection.HTTPSConnection object at 0x12ec7e5b0>: Failed to establish a new connection: [Errno 8] nodename nor servname provided, or not known'))"
  - generic [ref=e17]:
    - heading "Original Image" [level=3] [ref=e19]
    - heading "Suspect Image" [level=3] [ref=e21]
```